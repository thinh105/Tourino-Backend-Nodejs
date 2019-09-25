const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());

const port = '6969';

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf8')
);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello from the server side!',
    app: 'Natour'
  });
});

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: { tours }
  });
});

app.post('/api/v1/tours', (req, res) => {
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
});

app.listen(port, () => {
  console.log(`The server is running in port ${port} !`);
});
