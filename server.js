const dotenv = require('dotenv'); // connect environment variable config.env file
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({ path: './config.env' });

dotenv.config();

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
app.listen(port, () => {
  console.log(`The server is running in port ${port} !`);
});

// let nodemon = require('nodemon');
// // force a quit
// nodemon.emit('quit');
