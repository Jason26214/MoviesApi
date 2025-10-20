// In-memory data store
const movies = [];
let nextMovieId = 1;
let nextReviewId = 1;

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
const createMovie = (req, res) => {
  const { title, description, types } = req.body;

  // Validate request body
  if (!title || !description || !Array.isArray(types) || types.length === 0) {
    return res.status(400).json({
      message: 'All fields are required and types must be a non-empty array',
    });
  }

  // Create a new movie object
  const newMovie = {
    id: nextMovieId++,
    title,
    description,
    types,
    averageRating: 0,
    reviews: [],
  };

  // Add the new movie to the beginning of the movies array
  movies.unshift(newMovie);

  // Return the created movie
  res.status(201).json(newMovie);
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
 *           type: integer
 *         required: true
 *         description: ID of the movie to be deleted
 *     responses:
 *       204:
 *         description: Movie deleted successfully, no content returned
 *       404:
 *         description: Movie not found
 */
const deleteMovie = (req, res) => {
  const movieId = parseInt(req.params.id);
  const movieIndex = movies.findIndex((movie) => movie.id === movieId);
  // If movie not found, return 404
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' });
  }
  // Remove the movie from the array
  movies.splice(movieIndex, 1);
  res.status(204).send();
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
const getMovies = (req, res) => {
  // Extract query parameters
  let { keyword, sort, page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  // Prepare a copy of the movie array for manipulation
  let filteredMovies = [...movies];

  // Filtering
  if (keyword) {
    keyword = keyword.toLowerCase();
    filteredMovies = filteredMovies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(keyword) ||
        movie.description.toLowerCase().includes(keyword)
    );
  }

  // Sorting
  if (sort === 'rating') {
    filteredMovies.sort((a, b) => a.averageRating - b.averageRating);
  } else if (sort === '-rating') {
    filteredMovies.sort((a, b) => b.averageRating - a.averageRating);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

  // Return the result
  res.json(paginatedMovies);
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
 *           type: integer
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
const getMovieById = (req, res) => {
  const movie = movies.find((m) => m.id === parseInt(req.params.id));

  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  res.json(movie);
};

/**
 * @swagger
 * /v1/movies/{id}:
 *   put:
 *     summary: Update a movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
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
const updateMovie = (req, res) => {
  const movie = movies.find((m) => m.id === parseInt(req.params.id));
  if (!movie) {
    return res.status(404).json({ message: 'movie not found' });
  }

  const { title, description, types } = req.body;
  if (title) {
    movie.title = title;
  }
  if (description) {
    movie.description = description;
  }
  if (types) {
    if (!Array.isArray(types)) {
      return res.status(400).json({ message: 'types must be an array' });
    }
    movie.types = types;
  }
  res.json(movie);
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
