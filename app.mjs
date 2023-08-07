import express, { json } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { parse } from 'qs';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import tourRouter from './routes/tourRouter.mjs';
import userRouter from './routes/userRouter.mjs';
import reviewRouter from './routes/reviewRouter.mjs';

import AppError from './utils/appError.mjs';
import globalErrorHandler from './utils/errorHandler.mjs';

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
  return parse(string, {
    comma: true,
    arrayLimit: 30,
  });
});

// Set security HTTP headers
app.use(helmet());
app.use(cors());

// Limit requests from same API

if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    max: 70,
    windowMs: 15 * 60 * 1000,
    handler(request, response, next) {
      next(new AppError('Too many requests, please try again later!', 421));
    },
  });

  app.use('/api/', limiter);
}

// build-in middleware to get req.body ~ req.query from body
app.use(json({ limit: '20kb' }));

// Data Sanitization against:
app.use(mongoSanitize()); // NoSQL query injection
app.use(xss()); // XSS
app.use(
  hpp({
    whitelist: ['duration'],
  }),
); // parameter pollution

// Serving static files
// app.use(static(join('__dirname', 'public'))); //  `${__dirname}/public`));

// Test some custom middleware
// app.use((req, res, next) => {
//   console.log(req.headers, req.body);
//   next();
// });

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // middleware to show log on console
}

// 2 ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
