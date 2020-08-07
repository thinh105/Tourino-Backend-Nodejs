/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-console */

const fs = require('fs').promises;
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

const databaseConnectionString = process.env.DATABASE_CONNECTION_STRING.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
).replace('<dbname>', process.env.DATABASE_NAME);

mongoose
  .connect(databaseConnectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection succesful!'))
  .catch((error) => console.log(error));

// IMPORT DATA INTO DB
const importData = async () => {
  // READ JSON FILE
  const tourPath = path.join(__dirname, 'data', 'final.json');
  const tours = JSON.parse(await fs.readFile(tourPath, 'utf8'));
  /*   const reviews = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'reviews.json'), 'utf8')
  );
  const users = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf8')
  ); */

  const errorTours = [];

  const TourPromises = tours.map((tour) =>
    Tour.create(tour).catch((error) => errorTours.push({ tour, e: error }))
  );
  await Promise.all(TourPromises);

  await fs.writeFile('errorTour.json', JSON.stringify(errorTours));

  console.log('finished!!! :tada:');

  // ---------------------------
  // await Tour.insertMany(tours);
  // await User.insertMany(users);
  // await Review.insertMany(reviews);

  // await Tour.insertMany(tours, { lean: true });

  // have to use create to run the Document middleware (make slug) on Tour Model
  // Document middleware not support insertMany

  // lean: skips hydrating and validating the documents.
  /*     await User.insertMany(users, { lean: true });
    await Review.insertMany(reviews, {
      lean: true,
    });
    */

  /*   try {
    await Tour.create(tours);
    // await User.create(users, { validateBeforeSave: false });
    // await Review.create(reviews);

    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  } */
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
  } catch (error) {
    console.log(error);
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
