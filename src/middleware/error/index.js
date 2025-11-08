const validationErrorMiddleware = require('./validationError.middleware');
const notFoundErrorMiddleware = require('./notFoundError.middleware');
const conflictsErrorMiddleware = require('./conflictsError.middleware');
const finalErrorMiddleware = require('./finalError.middleware');

const errorMiddleware = [
  validationErrorMiddleware,
  notFoundErrorMiddleware,
  conflictsErrorMiddleware,
  finalErrorMiddleware,
];

module.exports = errorMiddleware;
