import * as Promise from "bluebird";
import { Queue } from "../init";

export function count(queueName: string): Promise<number> {
  return Queue.count({
    where: { queue: queueName }
  });
}
