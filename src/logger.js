import { createLogger, format, transports } from "winston";
import path from "path";

const LOG_LEVEL = process.env.LOG_LEVEL;

const logger = createLogger({
  level: LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp(),
    format.printf((info) => `${info.timestamp} [${info.level}] - ${info.message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      level: "error",
      filename: path.join(__dirname, "../logs", "error.log"),
      options: { flags: "a", mode: 0o666 }, // append, rwx 666
    }),
    new transports.File({
      level: "info",
      filename: path.join(__dirname, "../logs", "info.log"),
      options: { flags: "a", mode: 0o666 }, // append, rwx 666
    }),
  ],
});

export default logger;
