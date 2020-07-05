const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

const factory = require('./handlerFactory');

// ROUTE HANDLERS

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {
  findBySlug: true,
  populate: { path: 'reviews' },
});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stat = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4 } },
    },
    {
      $group: {
        // _id: '$difficulty',
        _id: '$duration',
        num: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { minPrice: 1 },
    },
    // ,
    // {
    //   $match: { _id: { $ne: 'easy'}}
    // }
  ]);
  res.status(200).json({
    status: 'success',
    result: stat.length,
    data: { stat },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const monthlyPlan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          // Date comparison on MongoDb
          $gte: new Date(`${year}-01-01`), //  Date() is Mongodb Object Constructors and Methods
          $lte: new Date(`${year}-12-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        // $month (aggregation) Returns the month of a date as a number between 1 and 12.
        numTourstarts: { $sum: 1 },
        tours: { $push: '$name' },
        // Returns an array of all values that result from applying an expression
        // to each document in a group of documents that share the same group by key.
        // $push is only available in the $group stage.
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourstarts: -1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    result: monthlyPlan.length,
    data: { monthlyPlan },
  });
});

exports.aliasTopFiveTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
