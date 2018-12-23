import * as Promise from "bluebird";
import { sequelize } from "../init";

export function close(): Promise<void> {
  return sequelize.close();
}
