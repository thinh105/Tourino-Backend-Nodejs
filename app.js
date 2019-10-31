const express = require('express');
const morgan = require('morgan');

const app = express();

const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

// 1 MIDDLEWARE

app.use(express.json()); //build-in middleware to get req.body ~ req.query

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //3rd party middleware to show log on console
}

// 2 ROUTES

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find '${req.originalUrl}' on this server!`), 404);
});

app.use(globalErrorHandler);
module.exports = app;
