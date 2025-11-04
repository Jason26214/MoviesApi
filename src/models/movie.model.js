const { Schema, model } = require('mongoose');

// Review schema (will be embedded in Movie schema)
const reviewSchema = new Schema(
  {
    content: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Movie schema
const movieSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    types: {
      type: [String],
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema], // Embedding reviews
  },
  {
    timestamps: true,
  }
);

module.exports = model('Movie', movieSchema);
