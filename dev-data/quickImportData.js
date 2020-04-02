/* eslint-disable no-console */

const fs = require('fs');
const mongoose = require('mongoose');

console.log(`${__dirname}`);

require('dotenv').config({ path: `${__dirname}/../config.env` });
// connect environment variable config.env file

const Tour = require('../models/tourModel');

// const DB = process.env.DATABASE_LOCAL;

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection succesful!'));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours.json`, 'utf8')
); // ./ refer to the folder that node start

const importData = async () => {
  try {
    await Tour.insertMany(tours, { ordered: false });
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
};

//console.log(process.argv);
// [
//   '/usr/bin/node',
//   '/home/bastian/myProjects/Node/Jonas Course - Natour/dev-data/quickImportData',
//   '-i'
// ]

if (process.argv[2] === '-i') importData();
if (process.argv[2] === '-d') deleteData();

// how to run ?
// node dev-data/quickImportData -i
// node dev-data/quickImportData -d
