const { logger } = require('../../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error('Unexpected error happened', {
    payload: {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    },
  });

  res.status(500).json({
    success: false,
    message: 'unintended error happened',
  });
};
