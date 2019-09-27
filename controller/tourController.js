const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf8')
);

// ROUTE HANDLERS

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

exports.updateTour = (req, res) => {
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

exports.deleteTour = (req, res) => {
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
