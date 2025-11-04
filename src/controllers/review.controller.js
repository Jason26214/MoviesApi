const Movie = require('../models/movie.model');
const { createLogger } = require('../utils/logger');
const logger = createLogger(__filename);

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
const getMovieReviews = async (req, res) => {
  try {
    const { id: movieId } = req.params;

    const movie = await Movie.findById(movieId).select('reviews');

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(200).json(movie.reviews);
  } catch (error) {
    logger.error('Get movie reviews failed', error);
    res
      .status(500)
      .json({ message: 'Error fetching reviews', error: error.message });
  }
};

/**
 * @swagger
 * /v1/movies/{id}/reviews:
 *   post:
 *     summary: Create a review for a movie
 *     tags: [Reviews]
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
 *       404:
 *         description: Movie not found
 */
const createReview = async (req, res) => {
  try {
    const { id: movieId } = req.params;
    const { content, rating } = req.body;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const newReview = { content, rating };
    movie.reviews.push(newReview);

    updateAverageRating(movie);

    await movie.save();

    res.status(201).json(movie.reviews[movie.reviews.length - 1]);
  } catch (error) {
    logger.error('Create review failed', error);

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res
        .status(400)
        .json({ message: 'Invalid request data', error: error.message });
    }

    res
      .status(500)
      .json({ message: 'Error creating review', error: error.message });
  }
};

/**
 * @swagger
 * /v1/reviews/{id}:
 *   patch:
 *     summary: Update a review by its ID
 *     tags: [Reviews]
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
 *       404:
 *         description: Review not found
 */
const updateReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;
    const { content, rating } = req.body;

    const movie = await Movie.findOne({ 'reviews._id': reviewId });

    if (!movie) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // `.id()` mongoose method to find subdocument by its id
    const review = movie.reviews.id(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

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
    logger.error('Update review failed', error);

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res
        .status(400)
        .json({ message: 'Invalid request data', error: error.message });
    }
    res
      .status(500)
      .json({ message: 'Error updating review', error: error.message });
  }
};

/**
 * @swagger
 * /v1/reviews/{id}:
 *   delete:
 *     summary: Delete a review by its ID
 *     tags: [Reviews]
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
 *       404:
 *         description: Review not found
 */
const deleteReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;

    const movie = await Movie.findOne({ 'reviews._id': reviewId });
    if (!movie) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = movie.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.deleteOne();

    updateAverageRating(movie);

    await movie.save();

    res.status(204).send();
  } catch (error) {
    logger.error('Delete review failed', error);

    if (error.name === 'CastError') {
      return res
        .status(400)
        .json({ message: 'Invalid review ID', error: error.message });
    }

    res
      .status(500)
      .json({ message: 'Error deleting review', error: error.message });
  }
};

module.exports = {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
};
