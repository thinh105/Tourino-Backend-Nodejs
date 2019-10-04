const Tour = require('../Models/tourModel');

// ROUTE HANDLERS

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: '',
    data: ''
  });
};

exports.getTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: ''
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    dataUpdate: ''
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: null
  });
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price)
    return res.status(400).json({
      status: 'fail',
      message: 'Missing Name or Price'
    });

  next();
};

exports.createTour = (req, res) => {
  //console.log(req.body);
};
