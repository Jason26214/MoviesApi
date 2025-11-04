const express = require('express');
const v1Router = express.Router();
const movieRouter = require('./movie.router');
const reviewRouter = require('./review.router');

// Mount movieRouter on v1Router
v1Router.use('/movies', movieRouter);
// Mount reviewRouter on v1Router
v1Router.use('/reviews', reviewRouter);

module.exports = v1Router;
