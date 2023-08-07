import AppError from './appError.mjs';

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}!!!`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  // errmsg: 'E11000 duplicate key error collection: natour.tours index: name_1 dup key: { : "Ha Nam Bay" }',
  // Use Regex to get the value in errmsg

  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!!!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((element) => element.message); // get a string of error messages

  const message = `Invalid input: ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid Token. Please log in again!!!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again!!!', 401);

const sendErrorDevelopment = (error, response) => {
  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error,
  });
};

const sendErrorProduction = (error, response) => {
  // Operational, trusted error: send message to client
  if (error.isOperational) {
    return response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });

    // Programming or other unknown error: don't leak error details
  }
  // 1) log error
  // eslint-disable-next-line no-console
  console.error('💥💥💥 ERROR 💥💥💥', error);

  // 2) Send generic message to client
  return response.status(500).json({
    status: 'error',
    message: 'Sorry, something went wrong!!!',
  });
};

export default (error, request, response, next) => {
  error.statusCode = error.statusCode || 500; // default is 500 - internal server error
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(error, response);
  } else if (process.env.NODE_ENV === 'production') {
    let apiError = { ...error };

    if (apiError.name === 'CastError') apiError = handleCastErrorDB(apiError);
    if (apiError.code === 11_000) apiError = handleDuplicateFieldsDB(apiError);
    if (apiError.name === 'ValidationError')
      apiError = handleValidationErrorDB(apiError);
    if (apiError.name === 'JsonWebTokenError') apiError = handleJWTError();
    if (apiError.name === 'TokenExpiredError')
      apiError = handleJWTExpiredError();

    sendErrorProduction(apiError, response);
  }
};
