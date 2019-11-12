const AppError = require('../utils/appError');

module.exports = (req, res, next) => {
  next(new AppError(`Can't find '${req.originalUrl}' on this server!`, 404));
};
