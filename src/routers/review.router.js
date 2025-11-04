const express = require('express');
const reviewRouter = express.Router();

const {
  updateReview,
  deleteReview,
} = require('../controllers/review.controller');

// Patch /v1/reviews/:id
reviewRouter.patch('/:id', updateReview);
// Delete /v1/reviews/:id
reviewRouter.delete('/:id', deleteReview);

module.exports = reviewRouter;
