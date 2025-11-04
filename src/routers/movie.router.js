const express = require('express');
const movieRouter = express.Router();
const movieController = require('../controllers/movie.controller');
const reviewController = require('../controllers/review.controller');
const authGuard = require('../middleware/authGuard');
const roleGuard = require('../middleware/roleGuard');

// Define movie routes
movieRouter.get('/', movieController.getMovies);
movieRouter.get('/:id', movieController.getMovieById);
movieRouter.post(
  '/',
  authGuard,
  roleGuard('admin'),
  movieController.createMovie
);
movieRouter.patch(
  '/:id',
  authGuard,
  roleGuard('admin'),
  movieController.updateMovie
);
movieRouter.delete(
  '/:id',
  authGuard,
  roleGuard('admin'),
  movieController.deleteMovie
);

// Define review routes
movieRouter.get('/:id/reviews', reviewController.getMovieReviews);
// authGuard will check the token and allow only legitimately logged-in users to review
movieRouter.post('/:id/reviews', authGuard, reviewController.createReview);

module.exports = movieRouter;
