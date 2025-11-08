const ConflictsException = require('../../exceptions/conflicts.exception');
const { logger } = require('../../utils/logger');

module.exports = (err, req, res, next) => {
  if (err instanceof ConflictsException) {
    logger.info('Conflicts error', {
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
