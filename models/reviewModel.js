const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please type your review'],
      minlength: [10, 'A review must have more than 10 chaacter'],
    },
    rating: {
      type: Number,
      default: 3,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createAt: {
      type: Date,
      default: Date.now(), // Mongoose will auto convert to today's date
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour!!!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to an User!!!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// QUERY MIDDLEWARE - auto pupulate user in review
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo', // just show name + photo and hide everything else for security
  });
  next();
});

// validate ID of user and tour
reviewSchema.plugin(idValidator);

reviewSchema.statics.calcAverageRatings = function (tourId) {
  this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
};

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
