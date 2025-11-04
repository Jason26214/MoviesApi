const express = require('express');
const reviewRouter = express.Router();
const authGuard = require('../middleware/authGuard');

const {
  updateReview,
  deleteReview,
} = require('../controllers/review.controller');

// Patch /v1/reviews/:id
reviewRouter.patch('/:id', authGuard, updateReview);
// Delete /v1/reviews/:id
reviewRouter.delete('/:id', authGuard, deleteReview);

module.exports = reviewRouter;
