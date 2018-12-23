import * as Sequelize from "sequelize";

interface Config {
  logging?: boolean;
  use_env_variable: string;
}

const env = process.env.NODE_ENV || "development";
const config: Config = require("../config/database.json")[env];

const pool: Sequelize.PoolOptions = {
  max: 5,
  min: 0,
  idle: 20000,
  acquire: 120000
};

export const sequelize = new Sequelize(
  process.env[config.use_env_variable],
  {  pool, ...config, operatorsAliases: false }
);

export const Queue = sequelize.import("./models/queue");
