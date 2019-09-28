const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf8')
);

// ROUTE HANDLERS

exports.checkId = (req, res, next, val) => {
  //console.log(`Tour ID is ${val}`);

  if (val >= tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });

  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: { tours }
  });
};

exports.getTour = (req, res) => {
  let id = parseInt(req.params.id);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour: tours[id] }
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    dataUpdate: { tour: req.body }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: null
  });
};

exports.createTour = (req, res) => {
  //console.log(req.body);

  let newId = tours[tours.length - 1].id + 1;

  let newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
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
