const ValidationException = require('../exceptions/validation.exception');

/**
 * Create a middleware for validating req.body
 * @param {import('joi').Schema} schema - Joi validation schema
 */
const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      // 1. Validate req.body using Joi
      // { stripUnknown: true } will automatically remove fields not defined in the schema
      // { allowUnknown: true } would allow unknown fields to exist (not recommended)
      req.body = await schema.validateAsync(req.body, {
        stripUnknown: true,
      });
      // 2. Validation passed, proceed to the next middleware (or route handler)
      next();
    } catch (e) {
      // 3. Joi validation failed, create a ValidationException
      // validationError.middleware will catch this error
      next(
        new ValidationException(e.message, {
          errorDetails: e.details, // attach detailed error info provided by Joi
        })
      );
    }
  };
};

module.exports = {
  validateBody,
};
