const express = require('express');
const morgan = require('morgan');
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 1 MIDDLEWARE

app.use(express.json()); //build-in middleware to get req.body ~ req.query

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //3rd party middleware to show log on console
}

// 2 ROUTES

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find '${req.originalUrl}' on this server!`
  });
});

module.exports = app;
