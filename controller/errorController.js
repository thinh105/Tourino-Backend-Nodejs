const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}!!!`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  // errmsg: 'E11000 duplicate key error collection: natour.tours index: name_1 dup key: { : "Ha Nam Bay" }',
  // Use Regex to get the value in errmsg

  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!!!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message); // get a string of error messages

  const message = `Invalid input: ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const sendErrorDevelopment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProduction = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    //Programming or other unknown error: don't leak error details
  } else {
    // 1) log error
    console.error('ERROR @#$%^', err);

    // 2) Send generic message to client
    res.status(500).json({
      status: 'error',
      message: 'Sorry, something went wrong!!!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // default is 500 - internal server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // not a good practise to override the arguments of function.

    //create a hard copy

    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProduction(error, res);
  }
};
