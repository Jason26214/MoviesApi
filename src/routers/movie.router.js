const express = require('express');
const movieRouter = express.Router();
const movieController = require('../controllers/movie.controller');

// Define movie routes
movieRouter.post('/', movieController.createMovie);
movieRouter.delete('/:id', movieController.deleteMovie);
movieRouter.post('/:id/reviews', movieController.createReview);
movieRouter.get('/', movieController.getMovies);
movieRouter.get('/:id', movieController.getMovieById);
movieRouter.put('/:id', movieController.updateMovie);
movieRouter.get('/:id/reviews', movieController.getMovieReviews);

module.exports = movieRouter;
