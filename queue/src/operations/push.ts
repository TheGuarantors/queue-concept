import * as Promise from "bluebird";
import { queueInstance } from "../init";
import { Message } from "../types";
import { QueueAttrs } from "../models/queue";

export function push(
  queueName: string,
  message: Message
): Promise<QueueAttrs> {
  return queueInstance.findOrCreate({
    where: {
      queue: queueName,
      message: encodeForQueue(message)
    }
  }).then(([result]) => result);
}

function encodeForQueue(message: Message): string {
  return JSON.stringify(message);
}
