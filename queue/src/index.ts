import * as Sequelize from "sequelize";
import * as Promise from "bluebird";

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

console.log("=== Create queue instance ===");

const sequelize = new Sequelize(
  process.env[config.use_env_variable],
  {  pool, ...config, operatorsAliases: false }
);

export function getCount(): Promise<number> {
  return sequelize.query(
    `select count(*) from "Queues"`,
    { type: sequelize.QueryTypes.SELECT }
  )
    .tap(console.log)
    .then(([{ count }]) => parseInt(count));
}

export function close() {
  sequelize.close();
}
