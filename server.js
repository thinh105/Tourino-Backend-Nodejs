const dotenv = require('dotenv'); // connect environment variable config.env file

dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT || 6969;
app.listen(port, () => {
  console.log(`The server is running in port ${port} !`);
});

// let nodemon = require('nodemon');

// // force a quit
// nodemon.emit('quit');
