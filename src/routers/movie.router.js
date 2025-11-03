const express = require('express');
const movieRouter = express.Router();
const movieController = require('../controllers/movie.controller');
const reviewController = require('../controllers/review.controller');

// Define movie routes
movieRouter.get('/', movieController.getMovies);
movieRouter.get('/:id', movieController.getMovieById);
movieRouter.post('/', movieController.createMovie);
movieRouter.patch('/:id', movieController.updateMovie);
movieRouter.delete('/:id', movieController.deleteMovie);
// Define review routes
movieRouter.post('/:id/reviews', reviewController.createReview);
movieRouter.get('/:id/reviews', reviewController.getMovieReviews);

module.exports = movieRouter;
