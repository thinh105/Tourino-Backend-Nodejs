/* eslint-disable no-console */

const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });
// connect environment variable config.env file

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.message);
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection succesful!'))
  .catch((err) => console.log(err));

const port = process.env.PORT || 6969;

const server = app.listen(port, () => {
  console.log(`The server is running in port ${port} !`);
});

// Unhandled promise rejections

process.on('unhandledRejection', (err) => {
  console.log(err);

  console.log('Unhandled promise rejections!!! Shutting down...');

  // shutdown gracefully with first close the server, and then shutdown the application
  // server.close give server time to finish all the requests before shutdown the app
  server.close(() => {
    process.exit(1);
  });
});

// let nodemon = require('nodemon');
// // force a quit
// nodemon.emit('quit');
