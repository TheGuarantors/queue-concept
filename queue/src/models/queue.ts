import * as sequelize from "sequelize";

export interface Queue extends sequelize.Instance<QueueAttrs>, QueueAttrs {}

export interface QueueModel extends sequelize.Model<Queue, QueueAttrs> {}

export interface QueueAttrs {
  createdAt?: Date;
  id?: number;
  message?: string;
  queue?: string;
  status?: Status;
  statusMessage?: string;
  updatedAt?: Date;
}

export type Status =
  "hubspot-status-code-error"
| "invalid-message"
| "processing"
| "unhandled-error"
| "unprocessed";

export default function(
  sequelize: sequelize.Sequelize,
  dataTypes: sequelize.DataTypes
): QueueModel {
  const model: QueueModel = sequelize.define<Queue, QueueAttrs>("Queue", {
    createdAt: {
      type: dataTypes.DATE,
      allowNull: false
    },
    id: {
      type: dataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    message: {
      type: dataTypes.STRING,
      allowNull: false
    },
    queue: {
      type: dataTypes.STRING,
      allowNull: false
    },
    status: {
      type: dataTypes.STRING,
      allowNull: false,
      defaultValue: "unprocessed"
    },
    statusMessage: {
      type: dataTypes.STRING,
      allowNull: true
    },
    updatedAt: {
      type: dataTypes.DATE,
      allowNull: false
    }
  });

  return model;
}
