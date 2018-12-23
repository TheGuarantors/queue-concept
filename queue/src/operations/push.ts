import * as Promise from "bluebird";
import { Queue } from "../init";
import { Message } from "../types";
import { QueueAttrs } from "../models/queue";

export function push(
  queueName: string,
  message: Message
): Promise<QueueAttrs> {
  return Queue.findOrCreate({
    where: {
      queue: queueName,
      message: encodeForQueue(message)
    }
  }).then(([result]) => result);
}

function encodeForQueue(message: Message): string {
  return JSON.stringify(message);
}
