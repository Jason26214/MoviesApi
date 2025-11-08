const Movie = require('../models/movie.model');
const { createLogger } = require('../utils/logger');
const logger = createLogger(__filename);
const NotFoundException = require('../exceptions/notFound.exception');

/**
 * A helper function to calculate and update the movie's average rating
 * based on its current reviews.
 * This function modifies the movie object in memory.
 * @param {object} movie - The Mongoose movie document
 */
const updateAverageRating = (movie) => {
  if (movie.reviews.length === 0) {
    movie.averageRating = 0;
  } else {
    const totalRating = movie.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    movie.averageRating = +(totalRating / movie.reviews.length).toFixed(2);
  }
};

/**
 * @swagger
 * /v1/movies/{id}/reviews:
 *   get:
 *     summary: Get all reviews for a specific movie
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the movie to get reviews for
 *     responses:
 *       200:
 *         description: List of reviews for the movie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       404:
 *         description: Movie not found
 */
const getMovieReviews = async (req, res, next) => {
  try {
    const { id: movieId } = req.params;

    const movie = await Movie.findById(movieId).select('reviews');

    if (!movie) {
      return next(new NotFoundException('Movie not found'));
    }

    res.status(200).json(movie.reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /v1/movies/{id}/reviews:
 *   post:
 *     summary: Create a review for a movie
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the movie to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewReview'
 *     responses:
 *       201:
 *         description: Review successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized (not logged in)
 *       404:
 *         description: Movie not found
 */
const createReview = async (req, res, next) => {
  try {
    const { id: movieId } = req.params;
    const { content, rating } = req.body;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return next(new NotFoundException('Movie not found'));
    }

    const newReview = { content, rating, author: req.user.id };
    movie.reviews.push(newReview);

    updateAverageRating(movie);

    await movie.save();

    res.status(201).json(movie.reviews[movie.reviews.length - 1]);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /v1/reviews/{id}:
 *   patch:
 *     summary: Update a review by its ID
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the review to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewReview'
 *     responses:
 *       200:
 *         description: Review successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized (not logged in)
 *       403:
 *         description: Forbidden (not review author or admin)
 *       404:
 *         description: Review not found
 */
const updateReview = async (req, res, next) => {
  try {
    const { id: reviewId } = req.params;
    const { content, rating } = req.body;

    const movie = await Movie.findOne({ 'reviews._id': reviewId });

    if (!movie) {
      return next(new NotFoundException('Review not found'));
    }

    // `.id()` mongoose method to find subdocument by its id
    const review = movie.reviews.id(reviewId);
    if (!review) {
      return next(new NotFoundException('Review not found'));
    }

    // --- Added ABAC permission checks ---
    // Check: 1. Is the current user the author? 2. Is the current user an administrator?
    if (review.author.toString() !== req.user.id && req.user.role !== 'admin') {
      logger.warn(
        `Permission denied: User ${req.user.id} is not the author or an admin.`
      );
      // If *neither* condition is met, return 403 Forbidden
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own reviews.',
      });
    }
    // --- New logic end ---

    if (content != undefined) {
      review.content = content;
    }
    if (rating != undefined) {
      review.rating = rating;
    }

    updateAverageRating(movie);

    await movie.save();

    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /v1/reviews/{id}:
 *   delete:
 *     summary: Delete a review by its ID
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the review to delete
 *     responses:
 *       204:
 *         description: Review successfully deleted (No Content)
 *       401:
 *         description: Unauthorized (not logged in)
 *       403:
 *         description: Forbidden (not review author or admin)
 *       404:
 *         description: Review not found
 */
const deleteReview = async (req, res, next) => {
  try {
    const { id: reviewId } = req.params;

    const movie = await Movie.findOne({ 'reviews._id': reviewId });
    if (!movie) {
      return next(new NotFoundException('Review not found'));
    }

    const review = movie.reviews.id(reviewId);
    if (!review) {
      return next(new NotFoundException('Review not found'));
    }

    // --- Added ABAC permission checks ---
    // Check: 1. Is the current user the author? 2. Is the current user an administrator?
    if (review.author.toString() !== req.user.id && req.user.role !== 'admin') {
      logger.warn(
        `Permission denied: User ${req.user.id} is not the author or an admin.`
      );
      // If *neither* condition is met, return 403 Forbidden
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own reviews.',
      });
    }
    // --- New logic end ---

    await review.deleteOne();

    updateAverageRating(movie);

    await movie.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
};
