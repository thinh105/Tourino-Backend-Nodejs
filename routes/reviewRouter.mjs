import { Router } from 'express';
import {
  getAllReviews,
  setTourUserIds,
  createReview,
  getReview,
  checkReviewOwner,
  updateReview,
  deleteReview,
} from '../controller/reviewController.mjs';
import { protect, restrictTo } from '../controller/authController.mjs';

const router = Router({ mergeParams: true });
// must pass {mergeParams: true} to the child router if you want to access the params from the parent router.

// router.use(authController.protect);

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(protect, restrictTo('user', 'admin'), checkReviewOwner, updateReview)
  .delete(protect, restrictTo('user', 'admin'), checkReviewOwner, deleteReview);
export default router;
