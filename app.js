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

const getAllTour = (req, res) => {
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

const createNewTour = (req, res) => {
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

// 3 ROUTES

app
  .route('/api/v1/tours')
  .get(getAllTour)
  .post(createNewTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// 4 START SERVER

const port = '6969';
app.listen(port, () => {
  console.log(`The server is running in port ${port} !`);
});
