const { Router } = require('express');
const { login, register } = require('../controllers/auth.controller');

const { validateBody } = require('../middleware/validation.middleware');
const authValidationSchema = require('../validations/auth.validation');

const authRouter = Router();

// POST /v1/auth/register
authRouter.post(
  '/register',
  validateBody(authValidationSchema.register),
  register
);

// POST /v1/auth/login
authRouter.post('/login', validateBody(authValidationSchema.login), login);

module.exports = authRouter;
