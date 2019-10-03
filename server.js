const dotenv = require('dotenv'); // connect environment variable config.env file
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

const DB = process.env.DATABASE_LOCAL;

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

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name']
    //unique: true
  },
  rating: {
    type: Number,
    default: 3
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  }
});

const Thinh = mongoose.model('Thinh', tourSchema);

const testTour = new Thinh({
  name: 'Thai binh la gi Boi',
  rating: 4.3,
  price: 897
});

testTour
  .save()
  .then(doc => {
    console.log(doc);
  })
  .catch(err => console.log('ERROR :', err));

// let nodemon = require('nodemon');
// // force a quit
// nodemon.emit('quit');
