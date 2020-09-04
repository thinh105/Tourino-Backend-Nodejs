const express = require('express');
const path = require('path');

const morgan = require('morgan');
const cors = require('cors');
const qs = require('qs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const app = express();

// 1 GLOBAL MIDDLEWARE
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

// Allow the query using comma for array :
// destinations[all]=Hue,Halong%20Bay = destinations: { all: [ 'Hue', 'Halong Bay' ] },
// in express 4. , app.set must above app.use
// https://github.com/expressjs/express/issues/3039

app.set('query parser', function (string) {
  return qs.parse(string, {
    comma: true,
    arrayLimit: 30,
  });
});

// Set security HTTP headers
app.use(helmet());
app.use(cors());

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later!',
});

app.use('/api/', limiter);

// build-in middleware to get req.body ~ req.query from body
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against:
app.use(mongoSanitize()); // NoSQL query injection
app.use(xss()); // XSS
app.use(
  hpp({
    whitelist: ['duration'],
  })
); // parameter pollution

// Serving static files
app.use(express.static(path.join('__dirname', 'public'))); //  `${__dirname}/public`));

// Test some custom middleware
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
