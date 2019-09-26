const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());

const port = '6969';

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf8')
);

const getAllTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: { tours }
  });
};

const getTour = (req, res) => {
  let id = parseInt(req.params.id);

  if (id < tours.length)
    return res.status(200).json({
      status: 'success',
      data: { tour: tours[id] }
    });

  res.status(404).json({
    status: 'fail',
    message: 'Invalid ID'
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
        data: { tours: newTour }
      });
    }
  );
};

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello from the server side!',
    app: 'Natour'
  });
});

// app.get('/api/v1/tours', getAllTour);

// app.get('/api/v1/tours/:id', getTour);

// app.post('/api/v1/tours', createNewTour);

app
  .route('/api/v1/tours')
  .get(getAllTour)
  .post(createNewTour);

app.route('/api/v1/tours/:id').get(getTour);

app.listen(port, () => {
  console.log(`The server is running in port ${port} !`);
});
