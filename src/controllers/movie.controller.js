// import the Movie model
const Movie = require('../models/movie.model');
const NotFoundException = require('../exceptions/notFound.exception');

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
const getMovies = async (req, res, next) => {
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
    next(error);
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
const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);

    // If the database does not find a document corresponding to that _id, it will not throw an error, but will return null.
    if (!movie) {
      return next(new NotFoundException('Movie not found'));
    }

    res.status(200).json(movie);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /v1/movies:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized (not logged in)
 *       403:
 *         description: Forbidden (not an admin)
 */
const createMovie = async (req, res, next) => {
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
    // Mongoose validation errors or CastErrors are automatically caught by validationError.middleware
    // 'CastError': `types` is defined as an array in the schema, so if a non-array value is provided, a CastError will be thrown. 'CastError' is an error thrown by Mongoose whenever it attempts to 'cast' one data type to another data type defined in the Schema (blueprint) and fails.
    next(error);
  }
};

/**
 * @swagger
 * /v1/movies/{id}:
 *   patch:
 *     summary: Update a movie by ID
 *     tags: [Movies]
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized (not logged in)
 *       403:
 *         description: Forbidden (not an admin)
 *       404:
 *         description: Movie not found
 */
const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, {
      new: true, // Ensure the updated document is returned, not the old one
      runValidators: true,
    });

    if (!updatedMovie) {
      return next(new NotFoundException('Movie not found'));
    }

    res.status(200).json(updatedMovie);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /v1/movies/{id}:
 *   delete:
 *     summary: Delete a movie by its ID
 *     tags: [Movies]
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized (not logged in)
 *       403:
 *         description: Forbidden (not an admin)
 *       404:
 *         description: Movie not found
 */
const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedMovie = await Movie.findByIdAndDelete(id);

    // If no movie found to delete, .findByIdAndDelete function will return null
    if (!deletedMovie) {
      return next(new NotFoundException('Movie not found'));
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
