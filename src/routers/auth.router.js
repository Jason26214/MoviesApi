const { Router } = require('express');
const { login, register } = require('../controllers/auth.controller');

const authRouter = Router();

// POST /v1/auth/register
authRouter.post('/register', register);

// POST /v1/auth/login
authRouter.post('/login', login);

module.exports = authRouter;
