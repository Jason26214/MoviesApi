const mongoose = require('mongoose');
const config = require('./config');
const { logger } = require('./logger');

const connectToDB = () => {
  const db = mongoose.connection;

  db.on('connecting', () => {
    logger.info('Connecting to db');
  });

  db.on('error', (error) => {
    logger.error(`DB error: ${error}`);
    process.exit(1);
  });

  db.on('connected', () => {
    logger.info('db connected');
  });

  return mongoose.connect(config.DB_CONNECTION_STRING);
};

module.exports = connectToDB;
