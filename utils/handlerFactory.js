/* eslint-disable unicorn/filename-case */
const catchAsync = require('./catchAsync');
const AppError = require('./appError');

const queryToMongo = require('./queryToMongo');
const sendResponse = require('./sendResponse');

exports.createOne = (Model) =>
  catchAsync(async (request, response, next) => {
    const document = await Model.create(request.body);

    sendResponse(document, 201, response);
  });

exports.getAll = (Model) =>
  catchAsync(async (request, response, next) => {
    // Allow Nested GET reviews on specific tour
    request.query.slug = request.params.slug || undefined;

    const { skip, limit, sort, fields, filter } = queryToMongo(request.query);

    const [total, result] = await Promise.all([
      Model.countDocuments(filter),
      Model.find(filter).sort(sort).select(fields).skip(skip).limit(limit),
    ]);

    // SEND RESPONSE

    sendResponse({ total, returned: result.length, result }, 200, response);
  });

/**
  * 
  * @param  { model }   Model   Mongoose Model 
  * @param  { Object }  Option  Specific options for Tour Controller
  * {
    findBySlug: boolean,
    populate: { path: 'reviews' },
    };
  */

exports.getOne = (Model, Option = {}) =>
  catchAsync(async (request, response, next) => {
    let query = Option.findBySlug
      ? Model.findOne({ slug: request.params.slug })
      : Model.findById(request.params.id);

    query = query.select('-__v -_id');

    if (Option.populate) query = query.populate(Option.populate);

    const document = await query;

    if (!document) return next(new AppError('No document found!!!', 404));

    sendResponse(document, 200, response);
  });

exports.updateOne = (Model, Option = {}) =>
  catchAsync(async (request, response, next) => {
    let document;

    if (Option.findBySlug) {
      document = await Model.findOneAndUpdate(
        { slug: request.params.slug },
        request.body,
        {
          new: true, // return the new Update document to client
          runValidators: true, // run the validator
        }
      );
    } else {
      document = await Model.findByIdAndUpdate(
        request.params.id,
        request.body,
        {
          new: true, // return the new Update document to client
          runValidators: true, // run the validator
        }
      );
    }

    if (!document) return next(new AppError('No document found!!!', 404));

    sendResponse(document, 200, response);
  });

exports.deleteOne = (Model, Option = {}) =>
  catchAsync(async (request, response, next) => {
    const document = Option.findBySlug
      ? await Model.findOneAndDelete({ slug: request.params.slug })
      : await Model.findByIdAndDelete(request.params.id);

    if (!document) return next(new AppError('No document found!!!', 404));

    // in RESTful API, common practice is not send anything back to client when deleted

    sendResponse(undefined, 204, response);
  });

exports.getDistinctValueAndCount = (Model, value) =>
  catchAsync(async (request, response, next) => {
    const document = await Model.aggregate([
      {
        $unwind: `$${value}`,
      },
      {
        $group: {
          _id: `$${value}`,
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          [value]: '$_id',
          _id: 0,
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    sendResponse(document, 200, response);
  });

exports.getTourStatistics = (Model) =>
  catchAsync(async (request, response, next) => {
    const stat = await Model.aggregate([
      {
        $match: { destinations: 'Hanoi' },
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
    sendResponse(stat, 200, response);
  });

exports.getMonthlyPlan = (Model) =>
  catchAsync(async (request, response, next) => {
    const { year } = request.params;
    const monthlyPlan = await Model.aggregate([
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

    sendResponse(monthlyPlan, 200, response);
  });
