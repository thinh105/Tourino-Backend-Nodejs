const express = require('express');
const path = require('path');

const morgan = require('morgan');
const cors = require('cors');
const qs = require('qs');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const app = express();

// 1 MIDDLEWARE
/*
const whitelist = new Set([
  'http://localhost:8080',
  'http://localhost:8081',
  '::ffff:127.0.0.1',
]);

const corsOptions = {
  origin(origin, callback) {
    if (whitelist.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions));
*/

// allow the query using comma for array :
// destinations[all]=Hue,Halong%20Bay = destinations: { all: [ 'Hue', 'Halong Bay' ] },
// in express 4. , app.set must above app.use
// https://github.com/expressjs/express/issues/3039
app.set('query parser', function (string) {
  return qs.parse(string, {
    comma: true,
    arrayLimit: 30,
  });
});

app.use(cors());

app.use(express.json()); // build-in middleware to get req.body ~ req.query
app.use(express.static(path.join('__dirname', 'public'))); //  `${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log(req.headers, req.body);
//   next();
// });

// middleware to show log on console
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2 ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
