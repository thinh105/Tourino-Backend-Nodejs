process.on('uncaughtException', err => {
  console.log(err);

  console.log('UncaughtException!!! Shutting down...');

  process.exit(1);
});

const dotenv = require('dotenv'); // connect environment variable config.env file
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

//const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection succesful!'));

const port = process.env.PORT || 6969;

const server = app.listen(port, () => {
  console.log(`The server is running in port ${port} !`);
});

//Unhandled promise rejections

process.on('unhandledRejection', err => {
  console.log(err);

  console.log('Unhandled promise rejections!!! Shutting down...');

  // shutdown gracefully with first close the server, and then shutdown the application
  //server.close give server time to finish all the requests before shutdown the app
  server.close(() => {
    process.exit(1);
  });
});

// let nodemon = require('nodemon');
// // force a quit
// nodemon.emit('quit');
