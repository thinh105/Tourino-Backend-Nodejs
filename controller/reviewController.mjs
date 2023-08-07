import Review from '../models/reviewModel.mjs';
import {
  getAll,
  getOne,
  createOne,
  deleteOne,
  updateOne,
} from '../utils/handlerFactory.mjs';
import AppError from '../utils/appError.mjs';

import catchAsync from '../utils/catchAsync.mjs';

export const getAllReviews = getAll(Review);
export const getReview = getOne(Review);
export const createReview = createOne(Review);
export const deleteReview = deleteOne(Review);
export const updateReview = updateOne(Review);

export function setTourUserIds(request, response, next) {
  // Allow nested routes

  if (!request.body.tour) request.body.tour = request.params.tourId;
  // if (!request.body.user)
  request.body.user = request.user.id;

  next();
}

export const checkReviewOwner = catchAsync(async (request, response, next) => {
  if (request.user.role === 'user') {
    const review = await Review.findById(request.params.id);

    if (request.user.id !== review.user.id)
      return next(
        new AppError(
          'You do not have permission to perform this action!!!',
          403,
        ),
      );
  }

  next();
});
