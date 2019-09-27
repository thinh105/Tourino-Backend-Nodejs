const express = require('express');

const tourRoutes = express.Router();

const tourController = require('../controller/tourController');

tourRoutes
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

tourRoutes
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRoutes;