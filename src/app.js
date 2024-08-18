import "dotenv/config";
import express from "express";
import morgan from "morgan";

import db from "./db";
import orderssRouter from "./router";
import logger from "./logger";

if (process.env.NODE_ENV !== "test") {
  db.sequelize
    .authenticate()
    .then(() => logger.info("Mysql connected"))
    .catch((err) => logger.info(`Mysql NOT connected, ${err.message}`));

  db.sequelize
    .sync({ force: false })
    .then(() => logger.info("Mysql schema synced"))
    .catch((err) => logger.info(`Mysql schema NOT synced, ${err.message}`));
}

const app = express();

app.use(morgan("common"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/orders", orderssRouter);

// error handler
app.use((err, req, res, next) => {
  logger.error(err.status);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

export default app;
