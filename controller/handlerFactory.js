const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // Allow Nested GET reviews on specific tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .selectFields()
      .paginate();
    const document = await features.query; // .explain() for statistics;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      result: document.length,
      // data: { data: document },
      data: document,
    });
  });

exports.getOne = (Model, Option = {}) =>
  catchAsync(async (req, res, next) => {
    // specific option for Tour Controller
    // getTour = factory.getOne(Tour, {
    // findBySlug: true,
    // populate: { path: 'reviews' },
    // });

    let query = Option.findBySlug
      ? await Model.findOne({ slug: req.params.slug })
      : await Model.findById(req.params.id);

    if (Option.populate) query = query.populate(Option.populate);

    const document = await query;

    if (!document) return next(new AppError('No document found!!!', 404));

    res.status(200).json({
      status: 'success',
      data: document,
      // data: document,
    });
  });

exports.updateOne = (Model, Option = {}) =>
  catchAsync(async (req, res, next) => {
    let document;

    if (Option.findBySlug) {
      document = await Model.findOneAndUpdate(
        { slug: req.params.slug },
        req.body,
        {
          new: true, // return the new Update document to client
          runValidators: true, // run the validator
        }
      );
    } else {
      document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // return the new Update document to client
        runValidators: true, // run the validator
      });
    }

    if (!document) return next(new AppError('No document found!!!', 404));

    res.status(200).json({
      status: 'success',
      data: document,
    });
  });

exports.deleteOne = (Model, Option = {}) =>
  catchAsync(async (req, res, next) => {
    const document = Option.findBySlug
      ? await Model.findOneAndDelete({ slug: req.params.slug })
      : await Model.findByIdAndDelete(req.params.id);

    if (!document) return next(new AppError('No document found!!!', 404));

    // in RESTful API, common practice is not send anything back to client when deleted
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
