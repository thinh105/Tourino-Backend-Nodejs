const Review = require('../models/reviewModel');
const handler = require('../utils/handlerFactory');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');

// ROUTE HANDLERS

exports.setTourUserIds = (request, response, next) => {
  // Allow nested routes

  if (!request.body.tour) request.body.tour = request.params.tourId;
  // if (!request.body.user)
  request.body.user = request.user.id;

  next();
};

exports.checkReviewOwner = catchAsync(async (request, response, next) => {
  if (request.user.role === 'user') {
    const review = await Review.findById(request.params.id);

    if (request.user.id !== review.user.id)
      return next(
        new AppError(
          'You do not have permission to perform this action!!!',
          403
        )
      );
  }

  next();
});

exports.getAllReviews = handler.getAll(Review);
exports.getReview = handler.getOne(Review);
exports.createReview = handler.createOne(Review);
exports.deleteReview = handler.deleteOne(Review);
exports.updateReview = handler.updateOne(Review);
