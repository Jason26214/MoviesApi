// import the Movie model
const Movie = require('../models/movie.model');
const { createLogger } = require('../utils/logger');

const logger = createLogger(__filename);

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - types
 *       properties:
 *         id:
 *           type: integer
 *           description: Automatically generated movie ID
 *         title:
 *           type: string
 *           description: Movie title
 *         description:
 *           type: string
 *           description: Movie description
 *         types:
 *           type: array
 *           items:
 *             type: string
 *           description: Movie genres
 *         averageRating:
 *           type: number
 *           format: float
 *           description: Average rating of the movie
 *         reviews:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Review'
 *           description: List of reviews for the movie
 *     Review:
 *       type: object
 *       required:
 *         - rating
 *         - content
 *       properties:
 *         id:
 *           type: integer
 *           description: Automatically generated review ID
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Rating given to the movie (1-5)
 *         content:
 *           type: string
 *           description: Review content
 *     NewMovie:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - types
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         types:
 *           type: array
 *           items:
 *             type: string
 *     NewReview:
 *       type: object
 *       required:
 *         - rating
 *         - content
 *       properties:
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         content:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   - name: Movies
 *     description: Movie management API
 *   - name: Reviews
 *     description: Movie review management API
 */

/**
 * @swagger
 * /v1/movies:
 *   get:
 *     summary: Get list of movies with filtering, sorting, and pagination
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Keyword to filter movies by title or description
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [rating, -rating]
 *         description: Sort by rating (ascending) or -rating (descending)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of movies per page
 *     responses:
 *       200:
 *         description: List of movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
const getMovies = async (req, res) => {
  try {
    // Extract query parameters
    let { keyword, sort, page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    // Mongoose filter object
    const filter = {};
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Mongoose sort object
    const sortOption = {};
    if (sort === 'rating') {
      sortOption.averageRating = 1; // Ascending
    } else if (sort === '-rating') {
      sortOption.averageRating = -1; // Descending
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Chain execution queries
    const movies = await Movie.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .exec();

    // Status and return
    res.status(200).json(movies);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching movies', error: error.message });
  }
};

/**
 * @swagger
 * /v1/movies/{id}:
 *   get:
 *     summary: Get a movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the movie to retrieve
 *     responses:
 *       200:
 *         description: Movie details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 */
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);

    // If the database does not find a document corresponding to that _id, it will not throw an error, but will return null.
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(200).json(movie);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching movie by ID', error: error.message });
  }
};

/**
 * @swagger
 * /v1/movies:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewMovie'
 *     responses:
 *       201:
 *         description: Movie successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid request body
 */
const createMovie = async (req, res) => {
  try {
    const { title, description, types } = req.body;

    // Create a new movie object
    const movie = new Movie({
      title,
      description,
      types,
      // averageRating and reviews will use default values in the schema
    });

    // Save the movie to the database
    await movie.save();

    // Return the created movie
    res.status(201).json(movie); // will include _id and timestamps
  } catch (error) {
    logger.error('Create movie failed', error);

    // 'CastError': `types` is defined as an array in the schema, so if a non-array value is provided, a CastError will be thrown. 'CastError' is an error thrown by Mongoose whenever it attempts to 'cast' one data type to another data type defined in the Schema (blueprint) and fails.
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res
        .status(400)
        .json({ message: 'Invalid request data', error: error.message });
    }

    res
      .status(500)
      .json({ message: 'Error creating movie', error: error.message });
  }
};

/**
 * @swagger
 * /v1/movies/{id}:
 *   patch:
 *     summary: Update a movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the movie to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               types:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Movie successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Movie not found
 */
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(200).json(updatedMovie);
  } catch (error) {
    logger.error('Update movie failed', error);

    // 'CastError' occurs when the provided id is not a valid ObjectId (verify id format)
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res
        .status(400)
        .json({ message: 'Invalid request data', error: error.message });
    }

    res
      .status(500)
      .json({ message: 'Error updating movie', error: error.message });
  }
};

/**
 * @swagger
 * /v1/movies/{id}:
 *   delete:
 *     summary: Delete a movie by its ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the movie to be deleted
 *     responses:
 *       204:
 *         description: Movie deleted successfully, no content returned
 *       404:
 *         description: Movie not found
 */
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMovie = await Movie.findByIdAndDelete(id);

    // If no movie found to delete, .findByIdAndDelete function will return null
    if (!deletedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting movie', error: error.message });
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
 *           type: integer
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
const createReview = (req, res) => {
  const movie = movies.find((movie) => movie.id === parseInt(req.params.id));

  // If movie not found, return 404
  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  // post a new review
  const { content, rating } = req.body;
  // Validate request body
  if (!content || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      message:
        'Content is required and rating must be an integer between 1 and 5',
    });
  }
  // Create a new review object
  const newReview = {
    id: nextReviewId++,
    content,
    rating,
  };
  // Add the new review to the movie's reviews array
  movie.reviews.push(newReview);
  // Recalculate the average rating
  const totalRating = movie.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  movie.averageRating = +(totalRating / movie.reviews.length).toFixed(2);

  // Return the created review
  res.status(201).json(newReview);
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
 *           type: integer
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
  createMovie,
  deleteMovie,
  createReview,
  getMovies,
  getMovieById,
  updateMovie,
  getMovieReviews,
};
