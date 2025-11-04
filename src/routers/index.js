const express = require('express');
const v1Router = express.Router();
const movieRouter = require('./movie.router');
const reviewRouter = require('./review.router');
const authRouter = require('./auth.router');

// Mount movieRouter on v1Router
v1Router.use('/movies', movieRouter);
// Mount reviewRouter on v1Router
v1Router.use('/reviews', reviewRouter);
// Mount authRouter on v1Router
v1Router.use('/auth', authRouter);

module.exports = v1Router;
