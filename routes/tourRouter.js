const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

router.route('/tour-statistics').get(tourController.getTourStatistics);

// Advanced Route

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('trn-admin', 'moderator', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/top-five-tours')
  // to avoid conflix with route('/:id'), place this router above router /:id
  .get(tourController.aliasTopFiveTours, tourController.getAllTours);

router.route('/destinations').get(tourController.getDestinationsAndCount);
router.route('/travelStyle').get(tourController.getTravelStyleAndCount);

// Normal CRUD route

router
  .route('/')
  .get(tourController.getAllTours)
  // .get(authController.protect, tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('trn-admin', 'moderator'),
    tourController.createTour
  );

// Nested Routes with Express
// the same on app.js ~> routes
// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/:id')
  .get(authController.protect, tourController.getTour)
  .patch(authController.protect, tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('trn-admin', 'moderator'),
    tourController.deleteTour
  );

module.exports = router;
