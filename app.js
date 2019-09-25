const express = require('express');
const fs = require('fs');

const app = express();
const port = '6969';

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, 'utf8')
);

app.get('/', (res, rep) => {
  rep.status(200).json({
    message: 'Hello from the server side!',
    app: 'Natour',
  });
});

app.get('/api/v1/tours', (res, rep) => {
  rep.status(200).json({
    status: 'success',
    result: tours.length,
    data: { tours },
  });
});

app.listen(port, () => {
  console.log(`The server is running in port ${port} !`);
});
