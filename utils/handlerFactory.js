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
    if (request.params.tourId) request.query.tour = request.params.tourId;

    const { skip, limit, sort, fields, filter } = queryToMongo(request.query);

    const [total, result] = await Promise.all([
      Model.countDocuments(filter),
      Model.find(filter).sort(sort).select(fields).skip(skip).limit(limit),
    ]);

    sendResponse({ total, returned: result.length, result }, 200, response);
  });

/**
 * @param  { model }   Model  - Mongoose Model
 * @param  { Object }  Option - Specific options for Tour Controller
 * @param {Object} Option.populate - populate virtual property - E.g: { path: 'reviews' }
 * @param {Object} Option.query - using findOne - not findById as default
 */

exports.getOne = (Model, Option = {}) =>
  catchAsync(async (request, response, next) => {
    let query = Option.query
      ? Model.findOne({ [Option.query]: request.params[Option.query] })
      : Model.findById(request.params.id);

    if (Option.populate) query = query.populate(Option.populate);
    query = query.select('-__v');

    const document = await query;

    if (!document) return next(new AppError('No document found!!!', 404));

    sendResponse(document, 200, response);
  });

exports.updateOne = (Model) =>
  catchAsync(async (request, response, next) => {
    const updateOption = {
      new: true, // return the new Update document to client
      runValidators: true, // run the validator
    };

    const document = await Model.findByIdAndUpdate(
      request.params.id,
      request.body,
      updateOption
    );

    if (!document) return next(new AppError('No document found!!!', 404));

    sendResponse(document, 200, response);
  });

exports.deleteOne = (Model) =>
  catchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndDelete(request.params.id);

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
          value: '$_id',
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
