const ValidationException = require('../../exceptions/validation.exception');
const { logger } = require('../../utils/logger'); // 确保引入 logger

module.exports = (err, req, res, next) => {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    logger.warn('Mongoose Validation Error', { error: err.message });
    res.status(400).json({ success: false, error: err.message });
    return;
  }

  // Joi validation error from ValidationException
  if (err instanceof ValidationException) {
    logger.warn('Joi validation error', {
      payload: err.payload,
    });
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  next(err);
};
