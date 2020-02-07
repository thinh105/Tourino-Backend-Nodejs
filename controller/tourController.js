const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// ROUTE HANDLERS

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { tour: newTour }
  });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  //EXECUTE QUERY

  const features = new APIFeatures(Tour.find(), req.query);

  features
    .filter()
    .sort()
    .selectFields()
    .paginate();

  const tours = await features.query;

  // SEND RESPONSE

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: { tours }
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stat = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4 } }
    },
    {
      $group: {
        //_id: '$difficulty',
        _id: '$duration',
        num: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { minPrice: 1 }
    }
    // ,
    // {
    //   $match: { _id: { $ne: 'easy'}}
    // }
  ]);
  res.status(200).json({
    status: 'success',
    result: stat.length,
    data: { stat }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const monthlyPlan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          // Date comparison on MongoDb
          $gte: new Date(`${year}-01-01`), //  Date() is Mongodb Object Constructors and Methods
          $lte: new Date(`${year}-12-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        // $month (aggregation) Returns the month of a date as a number between 1 and 12.
        numTourstarts: { $sum: 1 },
        tours: { $push: '$name' }
        // Returns an array of all values that result from applying an expression
        // to each document in a group of documents that share the same group by key.
        // $push is only available in the $group stage.
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numTourstarts: -1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    result: monthlyPlan.length,
    data: { monthlyPlan }
  });
});

exports.aliasTopFiveTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) return next(new AppError('No tour found with that ID!!!', 404));

  res.status(200).json({
    status: 'success',
    data: { tour }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return the new Update document to client
    runValidators: true // run the validator
  });

  if (!tour) return next(new AppError('No tour found with that ID!!!', 404));

  res.status(200).json({
    status: 'success',
    data: { tour }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) return next(new AppError('No tour found with that ID!!!', 404));

  // in RESTful API, common practice is not send anything back to client when deleted
  res.status(204).json({
    status: 'success',
    data: null
  });
});
