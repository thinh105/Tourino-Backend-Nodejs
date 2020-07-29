/* eslint-disable no-console */
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

// connect environment variable config.env file
require('dotenv').config({
  path: path.join(__dirname, '..', '/config.env'),
});

// console.log(`${__dirname}`); // /home/bastian/myProjects/Node/Jonas Course - Natour/dev-data

// const DB = process.env.DATABASE_LOCAL;

const dbConnectionString = process.env.DATABASE_CONNECTION_STRING.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
).replace('<dbname>', process.env.DATABASE_NAME);

mongoose
  .connect(dbConnectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection succesful!'))
  .catch((err) => console.log(err));

// IMPORT DATA INTO DB
const importData = async () => {
  // READ JSON FILE
  const tours = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'tourVN.json'), 'utf8')
  );
  const reviews = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'reviews.json'), 'utf8')
  );
  const users = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf8')
  );

  try {
    // await Tour.insertMany(tours);
    // await User.insertMany(users);
    // await Review.insertMany(reviews);

    // await Tour.insertMany(tours, { lean: true });

    // have to use create to run the Document middleware (make slug) on Tour Model
    // Document middleware not support insertMany
    await Tour.create(tours);

    // lean: skips hydrating and validating the documents.
    await User.insertMany(users, { lean: true });
    await Review.insertMany(reviews, {
      lean: true,
    });

    // await User.create(users, { validateBeforeSave: false });
    // await Review.create(reviews);

    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// console.log(process.argv);
// [
//   '/usr/bin/node',
//   '/home/bastian/myProjects/Node/Jonas Course - Natour/dev-data/quickImportData',
//   '-i'
// ]

if (process.argv[2] === '-i') importData();
if (process.argv[2] === '-d') deleteData();

// process.exit();

// how to run ?
// node dev-data/quickImportData -i
// node dev-data/quickImportData -d
// ----------------------------
// remember to turn off bcrypt hash password because the password are hashed
