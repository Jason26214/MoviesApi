const express = require('express');
const movieRouter = express.Router();
const movieController = require('../controllers/movie.controller');
const reviewController = require('../controllers/review.controller');
const authGuard = require('../middleware/authGuard'); // Import the authGuard middleware

// Define movie routes
movieRouter.get('/', movieController.getMovies);
movieRouter.get('/:id', movieController.getMovieById);
movieRouter.post('/', movieController.createMovie);
movieRouter.patch('/:id', movieController.updateMovie);
movieRouter.delete('/:id', movieController.deleteMovie);

// Define review routes
// authGuard will check the token and allow only legitimately logged-in users to review
movieRouter.post('/:id/reviews', authGuard, reviewController.createReview);
movieRouter.get('/:id/reviews', reviewController.getMovieReviews);

module.exports = movieRouter;
