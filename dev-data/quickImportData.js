/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-console */

const fs = require('fs').promises;
const mongoose = require('mongoose');
const path = require('path');

const bcrypt = require('bcryptjs');

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

const importTour = async () => {
  const tours = JSON.parse(
    // await fs.readFile(path.join(__dirname, 'data', 'Data-final.json'), 'utf8')
    await fs.readFile(path.join(__dirname, 'data', 'Data-final.json'), 'utf8')
  );

  const errorTours = [];

  const TourPromises = tours.map((tour) =>
    Tour.create(tour).catch((error) =>
      errorTours.push({ tour: tour.name, error })
    )
  );

  await Promise.all([...TourPromises]); // , UserPromises]);

  await fs.writeFile(
    'dev-data/data/errorTourReport.json',
    JSON.stringify({
      errorCount: errorTours.length,
      result: errorTours,
    })
  );

  console.log('🌟🌟🌟 Finished!!! 🌟🌟🌟');
  process.exit();
};

const randomArrayElement = (array) =>
  array[Math.floor(Math.random() * array.length)];

const usersGenerator = async () => {
  const user = [];
  const [firstName, lastName, picture] = (
    await Promise.all([
      fs.readFile(
        path.join(__dirname, 'data', 'fakeUser', 'first.json'),
        'utf8'
      ),
      fs.readFile(
        path.join(__dirname, 'data', 'fakeUser', 'last.json'),
        'utf8'
      ),
      fs.readFile(
        path.join(__dirname, 'data', 'fakeUser', 'picture.json'),
        'utf8'
      ),
    ])
  ).map((json) => JSON.parse(json));

  const count = +process.argv[3];

  let clonePictureArray = [...picture];

  for (let i = 0; i < count; i += 1) {
    const randomFirstName = randomArrayElement(firstName);
    const randomLastName = randomArrayElement(lastName);
    const randomPicture = randomArrayElement(clonePictureArray);

    // remove used Picture
    const index = clonePictureArray.indexOf(randomPicture);
    if (index > -1) {
      clonePictureArray.splice(index, 1);
    }

    // refill picture pool when it's empty
    if (clonePictureArray.length === 0) clonePictureArray = [...picture];

    const name = `${randomFirstName} ${randomLastName}`;
    const email = `${randomFirstName}${randomLastName}@mailinator.com`;

    // hash the password with cost of 13
    const password = await bcrypt.hash(process.argv[4], 13);

    user.push({
      name,
      email,
      password,
      photo: randomPicture,
    });
  }

  return user;
};

const insertUser = async (users) => {
  // if we need to pass obtion (validateBeforeSave)
  // the docs must be array, not a spread.
  const UserPromises = users.map((user) =>
    User.create([user], { validateBeforeSave: false }).catch((error) =>
      console.log({ user, error })
    )
  );

  await Promise.all(UserPromises);

  console.log('🌟🌟🌟 Finished!!! 🌟🌟🌟');
  process.exit();
};

const generateRandomUser = async () => {
  const users = await usersGenerator();
  await insertUser(users);
};

const importUserFromJson = async () => {
  const users = JSON.parse(
    await fs.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8')
  );

  await insertUser(users);
};

const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const importReviewFromJson = async () => {
  const reviews = JSON.parse(
    await fs.readFile(path.join(__dirname, 'data', 'reviews.json'), 'utf8')
  );

  const ReviewPromises = reviews.map((review) =>
    Review.create(review).catch(console.log)
  );

  await Promise.all([...ReviewPromises]);

  console.log('🌟🌟🌟 Finished!!! 🌟🌟🌟');
  process.exit();
};

const generateRandomReview = async () => {
  let [reviewFile, userIds] = await Promise.all([
    fs.readFile(path.join(__dirname, 'data', 'Review-final.json'), 'utf8'),
    User.find().select('id'),
  ]);

  const reviewsData = JSON.parse(reviewFile);
  userIds = userIds.map((element) => element._id);

  const reviews = [];
  const errorReviews = [];

  for (const reviewTour of reviewsData) {
    let tourIds;
    try {
      tourIds = (
        await Tour.find({
          name: reviewTour.name,
        }).select('id')
      )[0].id;
    } catch {}

    for (const e of reviewTour.reviews) {
      const a = {
        review: e.review,
        rating: e.rating,
        user: randomArrayElement(userIds),
        tour: tourIds,
        createAt: randomDate(new Date(2019, 0, 1), new Date()),
      };

      reviews.push(a);
    }
  }

  const ReviewPromises = reviews.map((review) =>
    Review.create(review).catch((error) => errorReviews.push({ error }))
  );

  await Promise.all([...ReviewPromises]);

  await fs.writeFile(
    'dev-data/data/errorReviewReport.json',
    JSON.stringify(errorReviews)
  );

  // console.log(reviews);

  console.log('🌟🌟🌟 Finished!!! 🌟🌟🌟');
  process.exit();
};

const deleteTour = async () => {
  try {
    await Tour.deleteMany();
    console.log('Tours: successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteNormalUser = async () => {
  try {
    await User.deleteMany({ role: 'user' });
    console.log('Users: successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
const deleteReview = async () => {
  try {
    await Review.deleteMany();
    await Tour.updateMany(
      {},
      {
        reviewsQuantity: 0,
        rating: 0,
      }
    );
    console.log('Reviews: successfully deleted');
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

if (process.argv[2] === '-iT') importTour();
if (process.argv[2] === '-iU') importUserFromJson();
if (process.argv[2] === '-iR') importReviewFromJson();

if (process.argv[2] === '-dT') deleteTour();
if (process.argv[2] === '-dU') deleteNormalUser();
if (process.argv[2] === '-dR') deleteReview();

if (process.argv[2] === '-iRR') generateRandomReview();
if (process.argv[2] === '-iRU') generateRandomUser();

// node dev-data/quickImportData -iT
// node dev-data/quickImportData -dT
// node dev-data/quickImportData -iRU numberOfGenerateUser password
// node dev-data/quickImportData -iRU 20 testpassword
//
// ----------------------------

// when import users,
// remember to turn off bcrypt hash password
// in UserModel because the password are hashed
