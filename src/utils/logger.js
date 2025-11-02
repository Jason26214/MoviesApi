const winston = require('winston');
const path = require('path');
const config = require('./config');

const createLogger = (filename) => {
  const logger = winston.createLogger({
    // read log level from .env
    level: config.LOG_LEVEL || 'info',
    defaultMeta: {
      file: filename ? path.basename(filename) : undefined,
    },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, file }) => {
        // add file's name in logger
        return `[${timestamp}]${
          file ? ` [${file}]` : ''
        } [${level}] [${message}]`;
      })
    ),
    transports: [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
      }),
      new winston.transports.Console(),
    ],
  });

  return logger;
};

module.exports = { logger: createLogger(), createLogger };
