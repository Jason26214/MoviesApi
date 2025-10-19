const express = require('express');
const cors = require('cors');

const app = express();
const v1Router = express.Router();
const movieRouter = express.Router();

// array to store movies
const movies = [];

//Used to generate auto-incrementing IDs
let nextMovieId = 1;
let nextReviewId = 1;

// a json middleware
app.use(express.json());
// cors middleware
app.use(cors());

/**
 * Create a new movie
 */
movieRouter.post('/', (req, res) => {
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
});

/**
 * Delete a movie by ID
 */
movieRouter.delete('/:id', (req, res) => {
  const movieId = parseInt(req.params.id);
  const movieIndex = movies.findIndex((movie) => movie.id === movieId);
  // If movie not found, return 404
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' });
  }
  // Remove the movie from the array
  movies.splice(movieIndex, 1);
  res.status(204).send();
});

/**
 * Post a review for a movie by ID
 */
movieRouter.post('/:id/reviews', (req, res) => {
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
});

/**
 * Get movie list with filtering, sorting, and pagination
 */
movieRouter.get('/', (req, res) => {
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
});

/**
 * Get a movie by ID
 */
movieRouter.get('/:id', (req, res) => {
  const movie = movies.find((m) => m.id === parseInt(req.params.id));

  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  res.json(movie);
});

/**
 * Put a movie by ID
 */
// app.put('/v1/movies/:id', (req, res) => {
//   const movieIndex = movies.findIndex((m) => m.id === parseInt(req.params.id));

//   if (movieIndex === -1) {
//     return res.status(404).json({ message: 'Movie not found' });
//   }

//   const { title, description, types } = req.body;
//   if (!title || !description || !Array.isArray(types) || types.length === 0) {
//     return res.status(400).json({
//       message: 'All fields are required and types must be a non-empty array',
//     });
//   }

//   const updatedMovie = {
//     id: movies[movieIndex].id,
//     title,
//     description,
//     types,
//     averageRating: movies[movieIndex].averageRating,
//     reviews: movies[movieIndex].reviews,
//   };

//   movies[movieIndex] = updatedMovie;

//   res.json(updatedMovie);
// });
movieRouter.put('/:id', (req, res, next) => {
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
});

/**
 * Get all reviews for a specific movie
 */
movieRouter.get('/:id/reviews', (req, res) => {
  const movie = movies.find((m) => m.id === parseInt(req.params.id));

  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  res.json(movie.reviews);
});

// Mount movieRouter on v1Router
v1Router.use('/movies', movieRouter);
// Mount v1Router
app.use('/v1', v1Router);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
