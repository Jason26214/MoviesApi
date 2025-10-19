const express = require('express');
const v1Router = express.Router();
const movieRouter = require('./movie.router');

// Mount movieRouter on v1Router
v1Router.use('/movies', movieRouter);

module.exports = v1Router;
