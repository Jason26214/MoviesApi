// Joi Schemas
const Joi = require('joi');

const usernameSchema = Joi.string()
  // Rule: can only contain letters, numbers and underscores
  .regex(/^[a-zA-Z0-9_]+$/)
  // Rule: length must be between 6 and 20 characters
  .min(6)
  .max(20)
  .required()
  // Custom error messages
  .messages({
    'string.pattern.base':
      'Username may only contain letters, numbers, and underscores (_)',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must not exceed 20 characters',
    'any.required': 'Username is required',
  });

const passwordSchema = Joi.string()
  // Rule: at least 8 characters long
  .min(8)
  // Rule: must include uppercase, lowercase, numbers and special characters
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$])'))
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base':
      'Password must include uppercase letters, lowercase letters, numbers and special characters (e.g. !@#$)',
    'any.required': 'Password is required',
  });

const authValidationSchema = {
  // Schema for registration
  register: Joi.object({
    username: usernameSchema,
    password: passwordSchema,
  }),
  // Schema for login
  // Login usually doesn't require the same strict rules as registration, so only presence is validated
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

module.exports = authValidationSchema;
