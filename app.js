const express = require('express');
const morgan = require('morgan');
const path = require('path');
const AppError = require('./utils/appError');

const app = express();

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');

const globalErrorHandler = require('./controller/errorController');

// 1 MIDDLEWARE

app.use(express.json()); // build-in middleware to get req.body ~ req.query

app.use(express.static(path.join('__dirname', 'public'))); //  `${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log(req.headers);
//   next();
// });

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // 3rd party middleware to show log on console
}

// 2 ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
