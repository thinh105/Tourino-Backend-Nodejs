const express = require('express');

const morgan = require('morgan');

const app = express();

const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');

// 1 MIDDLEWARE

app.use(express.json()); //build-in middleware

app.use(morgan('dev')); //3rd party middleware

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
}); //own middleware

// 2 ROUTES

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

module.exports = app;
