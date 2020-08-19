const Review = require('../models/reviewModel');
const handler = require('../utils/handlerFactory');

// ROUTE HANDLERS

exports.setTourUserIds = (request, response, next) => {
  // Allow nested routes

  if (!request.body.tour) request.body.tour = request.params.tourId;
  if (!request.body.user) request.body.user = request.user.id;
  next();
};

exports.getAllReviews = handler.getAll(Review);
exports.getReview = handler.getOne(Review);
exports.createReview = handler.createOne(Review);
exports.deleteReview = handler.deleteOne(Review);
exports.updateReview = handler.updateOne(Review);
