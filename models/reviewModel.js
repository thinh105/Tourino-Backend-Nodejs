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

// Make sure to one user can review one time in each tour only
// reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
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

  if (stats.length > 0) {
    await this.model('Tour').findByIdAndUpdate(tourId, {
      reviewsQuantity: stats[0].nRating,
      rating: stats[0].avgRating,
    });
  } else {
    await this.model('Tour').findByIdAndUpdate(tourId, {
      reviewsQuantity: 0,
      rating: 0,
    });
  }
};

// Calculate the reviewsQuantity and rating when new Review come
reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRatings(this.tour); // `this` points to current review
});

// Calculate the reviewsQuantity and rating when Update/Delete old Review

// findByIdAndUpdate & findByIdAndDelete all using findOneAnd
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.getUpdatedTourId = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne() does not work in post, query has already executed
  // so we have to get it from middleware above

  await this.getUpdatedTourId.constructor.calcAverageRatings(
    this.getUpdatedTourId.tour
  );
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
