const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

// 1 MIDDLEWARE

app.use(express.json()); //build-in middleware

app.use(morgan('dev')); //3rd party middleware

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
}); //own middleware

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf8')
);

// 2 ROUTE HANDLERS

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: { tours }
  });
};

const getTour = (req, res) => {
  let id = parseInt(req.params.id);

  if (id >= tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour: tours[id] }
  });
};

const updateTour = (req, res) => {
  let id = parseInt(req.params.id);

  if (id >= tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    dataUpdate: { tour: req.body }
  });
};

const deleteTour = (req, res) => {
  let id = parseInt(req.params.id);

  if (id >= tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });

  res.status(204).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: null
  });
};

const createTour = (req, res) => {
  //console.log(req.body);

  let newId = tours[tours.length - 1].id + 1;

  let newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      if (err) throw err;
      res.status(201).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: { tours: newTour }
      });
    }
  );
};

const getAllUsers = (req, res) => {
  res.status(250).json({
    status: 'error',
    requestedAt: req.requestTime,
    message: 'This route is not defined yet!'
  });
};
const getUser = (req, res) => {
  res.status(250).json({
    status: 'error',
    requestedAt: req.requestTime,
    message: 'This route is not defined yet!'
  });
};
const updateUser = (req, res) => {
  res.status(250).json({
    status: 'error',
    requestedAt: req.requestTime,
    message: 'This route is not defined yet!'
  });
};
const deleteUser = (req, res) => {
  res.status(250).json({
    status: 'error',
    requestedAt: req.requestTime,
    message: 'This route is not defined yet!'
  });
};
const createUser = (req, res) => {
  res.status(250).json({
    status: 'error',
    requestedAt: req.requestTime,
    message: 'This route is not defined yet!'
  });
};

// 3 ROUTES

const tourRouter = express.Router();
const userRouter = express.Router();

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

tourRouter
  .route('/')
  .get(getAllTours)
  .post(createTour);

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

userRouter
  .route('/')
  .get(getAllUsers)
  .post(createUser);

userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// 4 START SERVER

const port = '6969';
app.listen(port, () => {
  console.log(`The server is running in port ${port} !`);
});

// let nodemon = require('nodemon');

// // force a quit
// nodemon.emit('quit');
