const Tour = require('../Models/tourModel');

// ROUTE HANDLERS

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: newTour }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY

    // 1A - Basic Filtering

    // ...tours?duration=5&difficulty=easy
    //req.query = { duration: '5',difficulty: 'easy' }
    // Query in MongoDb : await Tour.find({ duration: '5',difficulty: 'easy' } );

    const queryObj = { ...req.query }; // using destructuring to hard copy in ES6

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B - Advanced Filtering

    // ...tours?duration[gte]=5&difficulty=easy

    // Express parse query  { duration: { gte:'5'},difficulty: 'easy' }
    // MongoDB query { duration: { $gte:'5'},difficulty: 'easy' }

    // string need to replace:  gte, gt, lte, lt

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // \b: match the exact word - g change all the time
    // using regular expressions -> google stackoverflow to find out

    console.log(JSON.parse(queryStr));

    let query = Tour.find(JSON.parse(queryStr));

    // 2 - Sorting

    // tours?sort=price

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy); //sort is the Mongoose method
    } else {
      query = query.sort('-ratingsAverage');
    }

    // 3 - Field Selection

    //tours?fields=name,duration,difficulty,price

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else query = query.select('-__v'); //using - to exlcude some field

    // 4 - Pagination

    //tours?page=2&limit=10

    // page = 2 & limit = 10
    // page1: 1-10, page2: 11-20, page3: 21-30

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist!!!');
    }

    //EXECUTE QUERY

    const tours = await query;

    // SEND RESPONSE

    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: { tours }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.aliasTopFiveTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { tour }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      dataUpdate: { tour }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    // in RESTful API, common practice is not send anything back to client when deleted
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
