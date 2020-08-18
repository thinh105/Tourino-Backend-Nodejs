const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const ApiFeatures = require('../utils/apiFeatures');
const queryToMongo = require('../utils/queryToMongo');

exports.createOne = (Model) =>
  catchAsync(async (request, response, next) => {
    const document = await Model.create(request.body);

    response.status(201).json({
      status: 'success',
      data: document,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (request, response, next) => {
    // Allow Nested GET reviews on specific tour
    request.query.slug = request.params.slug || undefined;

    const { skip, limit, sort, fields, filter } = queryToMongo(request.query);

    const [resultTotal, data] = await Promise.all([
      Model.countDocuments(filter),
      Model.find(filter).sort(sort).select(fields).skip(skip).limit(limit),
    ]);

    // SEND RESPONSE
    response.status(200).json({
      status: 'success',
      resultTotal,
      resultReturned: data.length,
      data,
    });
  });

/**
  * 
  * @param { model } Model Mongoose Model 
  * @param { Object } Option Specific options for Tour Controller
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

    response.status(200).json({
      status: 'success',
      data: document,
    });
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

    response.status(200).json({
      status: 'success',
      data: document,
    });
  });

exports.deleteOne = (Model, Option = {}) =>
  catchAsync(async (request, response, next) => {
    const document = Option.findBySlug
      ? await Model.findOneAndDelete({ slug: request.params.slug })
      : await Model.findByIdAndDelete(request.params.id);

    if (!document) return next(new AppError('No document found!!!', 404));

    // in RESTful API, common practice is not send anything back to client when deleted
    response.status(204).json({
      status: 'success',
    });
  });
