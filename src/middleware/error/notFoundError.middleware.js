const NotFoundException = require('../../exceptions/notFound.exception');
const { logger } = require('../../utils/logger');

module.exports = (err, req, res, next) => {
  if (err instanceof NotFoundException) {
    logger.info('Resource not found', {
      payload: err.payload,
      path: req.path,
    });
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  next(err);
};
