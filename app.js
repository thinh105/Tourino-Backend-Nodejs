const express = require('express');

const app = express();

app.get('/', (res, rep) => {
  rep.status(200).json({
    message: 'Hello from the server side!',
    app: 'Natour',
  });
});

const port = '6969';

app.listen(port, () => {
  console.log(`The server is running in port ${port} !`);
});
