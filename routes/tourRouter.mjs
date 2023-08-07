import { Router } from 'express';
import {
  aliasTopFiveTours,
  getAllTours,
  getDestinationsAndCount,
  getTravelStyleAndCount,
  createTour,
  getTourBySlug,
  getTour,
  updateTour,
  deleteTour,
} from '../controller/tourController.mjs';
import { protect, restrictTo } from '../controller/authController.mjs';
import reviewRouter from './reviewRouter.mjs';

const router = Router();

// Advanced Route

router
  .route('/top-five-tours')
  // to avoid conflix with route('/:id'), place this router above router /:id
  .get(aliasTopFiveTours, getAllTours);

router.route('/destinations').get(getDestinationsAndCount);
router.route('/travelStyle').get(getTravelStyleAndCount);

// Normal CRUD route

router
  .route('/')
  .get(getAllTours)
  // .get(authController.protect, tourController.getAllTours)
  .post(protect, restrictTo('trn-admin', 'moderator'), createTour);

// Nested Routes with Express
// the same on app.js ~> routes
// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
router.use('/:tourId/reviews', reviewRouter);

router.route('/slug/:slug').get(getTourBySlug);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('trn-admin', 'moderator'), updateTour)
  .delete(protect, restrictTo('trn-admin', 'moderator'), deleteTour);

export default router;
