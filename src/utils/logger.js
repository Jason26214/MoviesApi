const winston = require('winston');
const path = require('path');
const config = require('./config');

const createLogger = (filename) => {
  const logger = winston.createLogger({
    level: config.LOG_LEVEL || 'info',
    defaultMeta: {
      file: filename ? path.basename(filename) : undefined,
    },

    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }), // <--- (A) find error from stack
      winston.format.json() // <--- (B) default format is JSON
    ),

    transports: [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
      }),
    ],
  });

  // If not in production, log to the console with a colorful format
  if (config.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          winston.format.printf(
            ({ level, message, stack, file, timestamp }) => {
              const fileLabel = file ? ` [${file}]` : '';
              return `${timestamp} ${level}${fileLabel}: ${stack || message}`;
            }
          )
        ),
      })
    );
  } else {
    // In production, log to console in JSON format. Easy to read by log management tools (like Datadog, Kibana).
    logger.add(new winston.transports.Console());
  }

  return logger;
};

module.exports = { logger: createLogger(), createLogger };
