const express = require('express');
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

// Advanced Route

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

router.route('/slug/:slug').get(tourController.getTourBySlug);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('trn-admin', 'moderator'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('trn-admin', 'moderator'),
    tourController.deleteTour
  );

module.exports = router;
