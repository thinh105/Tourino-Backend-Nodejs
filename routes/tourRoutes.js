const express = require('express');
const tourController = require('../controller/tourController');
const { protect } = require('../controller/authController');

const router = express.Router();

//router.param('id', tourController.checkId);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/top-five-tours') // to avoid conflix with route('/:id'), place this router above router /:id
  .get(tourController.aliasTopFiveTours, tourController.getAllTours);

router
  .route('/')
  .get(protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(protect, tourController.getTour)
  .patch(protect, tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
