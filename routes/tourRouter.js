const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');

const reviewRouter = require('./reviewRouter');

const router = express.Router();

router.route('/tour-statistics').get(tourController.getTourStatistics);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('trn-admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/top-five-tours')
  // to avoid conflix with route('/:id'), place this router above router /:id
  .get(tourController.aliasTopFiveTours, tourController.getAllTours);

router.route('/destinations').get(tourController.getDestinationsAndCount);
router.route('/travelStyle').get(tourController.getTravelStyleAndCount);

router
  .route('/')
  .get(tourController.getAllTours)
  // .get(authController.protect, tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('trn-admin', 'lead-guide'),
    tourController.createTour
  );

// Nested Routes with Express
router.use('/:slug/reviews', reviewRouter); // the same on app.js ~> routes

router
  .route('/:slug')
  .get(authController.protect, tourController.getTour)
  .patch(authController.protect, tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('trn-admin', 'leadGuide'),
    tourController.deleteTour
  );

module.exports = router;
