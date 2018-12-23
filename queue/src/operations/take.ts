import * as Promise from "bluebird";

import { sequelize } from "../init";
import { QueueAttrs } from "../models/queue";

export default function take(
  queueName: string,
): Promise<QueueAttrs[]> {
  const preparedStatement =
    `UPDATE "Queues" SET status = 'processing' ` +
    `WHERE ID =` +
    ` (SELECT ID FROM "Queues"` +
    `  WHERE "status" = 'unprocessed' AND "queue" = :queueName` +
    `  ORDER BY "createdAt" ASC LIMIT 1) ` +
    `RETURNING id, message;`;
  return sequelize.query(preparedStatement, {
    replacements: {
      queueName: queueName
    },
    type: sequelize.QueryTypes.SELECT
  });
}
