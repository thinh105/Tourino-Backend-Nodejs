const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

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
    let filterModel = {};
    if (request.params.slug) filterModel = { slug: request.params.slug };

    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filterModel), request.query)
      .filter()
      .sort()
      .selectFields()
      .paginate();
    const document = await features.query; // .explain() for statistics;

    // SEND RESPONSE
    response.status(200).json({
      status: 'success',
      result: document.length,
      data: document,
    });
  });

/**
  * 
  * @param {model} Model Mongoose Model 
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
