const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('../../Models/tourModel');

dotenv.config({ path: './config.env' });

// const DB = process.env.DATABASE_LOCAL;

const DB = process.env.DATABASE.replace(
  '<password>',
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
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8')
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

//importData();
//deleteData();

// console.log(process.argv);

if (process.argv[2] === '-i') importData();
if (process.argv[2] === '-d') deleteData();

// how to run ? node dev-data/data/quickImport -i
