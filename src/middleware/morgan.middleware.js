const morgan = require('morgan');
const { logger } = require('../utils/logger');

module.exports = morgan(
  process.env.NODE_ENV === 'development' ? 'dev' : 'common',
  {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  }
);
