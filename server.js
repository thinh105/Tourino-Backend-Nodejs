const app = require('./app');

const port = '6969';
app.listen(port, () => {
  console.log(`The server is running in port ${port} !`);
});

// let nodemon = require('nodemon');

// // force a quit
// nodemon.emit('quit');
