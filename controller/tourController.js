const Tour = require('../models/tourModel');
const handler = require('../utils/handlerFactory');

// ROUTE HANDLERS

exports.getAllTours = handler.getAll(Tour);
exports.getTour = handler.getOne(Tour, {
  // populate: { path: 'reviews' },
});

exports.createTour = handler.createOne(Tour);
exports.updateTour = handler.updateOne(Tour);
exports.deleteTour = handler.deleteOne(Tour);

exports.getTourBySlug = handler.getOne(Tour, {
  query: 'slug', // { slug: request.params.slug },
});

exports.getTourStatistics = handler.getTourStatistics(Tour);

exports.getDestinationsAndCount = handler.getDistinctValueAndCount(
  Tour,
  'destinations'
);

exports.getTravelStyleAndCount = handler.getDistinctValueAndCount(
  Tour,
  'travelStyle'
);

exports.getMonthlyPlan = handler.getMonthlyPlan(Tour);

exports.aliasTopFiveTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-rating,price';
  request.query.fields = 'name,price,rating,summary';
  next();
};
