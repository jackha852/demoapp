import { Sequelize, DataTypes } from "sequelize";
import getModel from "./model";
import logger from "./logger";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_TYPE,
    timezone: process.env.DB_TZ,
    logging: process.env.NODE_ENV === "production" ? false : (sql) => logger.info(sql),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.DataTypes = DataTypes;
db.orders = getModel(sequelize, DataTypes);

export default db;
