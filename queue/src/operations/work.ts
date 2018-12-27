import * as Promise from "bluebird";
import { take } from "./take";
import { queueInstance } from "../init";
import { InvalidQueueMessageError, HubSpotNetworkError } from "../errors";
import { Logger, Message, Queueable, QueueablesMap } from "../types";
import { Queue, QueueAttrs, Status } from "../models/queue";

interface ErrorMessage {
  [message: string]: (queueRecord?: QueueAttrs, logger?: Logger) => Error;
}

export function work(
  queueName: string,
  queueables: QueueablesMap,
  logger: Logger
): Promise<void[]> {
  return Promise.map<QueueAttrs, void>(take(queueName), queueRecord => {
    return parseJson<Message>(queueRecord.message)
      .then(message => {
        return getQueueable(message.action, queueables)
          .then(worker => worker(message.data))
          .then(() => queueInstance.destroy({ where: { id: queueRecord.id } }));
      })
      .catch(SyntaxError, _err => {
        return updateStatusWithMessage(queueRecord.id, "invalid-message");
      })
      .catch(err => {
        if (err.message.includes("RequestError")) {
          logger.error(`HubSpot network error, marking queue message: ${err.message}`);
          return updateStatusWithMessage(queueRecord.id, "unprocessed");
        }
        if (err.message.includes("StatusCodeError")) {
          logger.error(`HubSpot status code error, marking queue message: ${err.message}`);
          return updateStatusWithMessage(queueRecord.id, "hubspot-status-code-error", err.message);
        }
        return updateStatusWithMessage(queueRecord.id, "unhandled-error", err.message);
      })
      .then(() => assignError(queueRecord, logger));
  });
}

function getQueueable(key: string, queueables: QueueablesMap): Promise<Queueable> {
  return new Promise<Queueable>((resolve, reject) => {
    if (queueables.hasOwnProperty(key)) {
      return resolve(queueables[key]);
    }
    return reject(new InvalidQueueMessageError(`Invalid queueable key: ${key}`));
  });
}

function parseJson<T>(json: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    try {
      const parsed = JSON.parse(json);
      return resolve(parsed);
    } catch (error) {
      return reject(new SyntaxError(error.message));
    }
  });
}

function updateStatusWithMessage(id: number, status: Status, statusMessage: string = null): Promise<Queue> {
  return queueInstance.update(
    { status, statusMessage },
    {
      where: { id },
      returning: true
    }
  ).spread((_cnt, [record]) => record);
}

function assignError(queueRecord: QueueAttrs, logger: Logger): Promise<Error> {
  return queueInstance.findOne({
    where: {
      id: queueRecord.id
    }
  }).then(queue => {
    if (queue) {
      const handler = queue.status in errorMessages ? errorMessages[queue.status] : errorMessages.default;
      return Promise.reject(handler(queueRecord, logger));
    }
    logger.info(`Message ${queueRecord.message} has been processed`);
  });
}

const errorMessages: ErrorMessage = {
  "invalid-message": invalidMessage,
  unprocessed: (_queueRecord, _logger) => new HubSpotNetworkError("RequestError"),
  "hubspot-status-code-error": (_queueRecord, _logger) => new HubSpotNetworkError("StatusCodeError"),
  default: (_queueRecord, _logger) => new Error("Unhandled Error")
};

function invalidMessage(queueRecord: QueueAttrs, logger: Logger): Error {
  const errorMessage = `Invalid queue message: ${queueRecord.message}`;
  logger.error(errorMessage);
  return new InvalidQueueMessageError(errorMessage);
}
