const Movie = require('../models/movie.model');
const { createLogger } = require('../utils/logger');
const logger = createLogger(__filename);

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

    if (!content || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message:
          'Content is required and rating must be an integer between 1 and 5',
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const newReview = { content, rating };
    movie.reviews.push(newReview);

    const totalRating = movie.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    movie.averageRating = +(totalRating / movie.reviews.length).toFixed(2);

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
const getMovieReviews = (req, res) => {
  const movie = movies.find((m) => m.id === parseInt(req.params.id));

  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  res.json(movie.reviews);
};

module.exports = {
  createReview,
  getMovieReviews,
};
