import * as Promise from "bluebird";
import { queueInstance } from "../init";

export function count(queueName: string): Promise<number> {
  return queueInstance.count({
    where: { queue: queueName }
  });
}
