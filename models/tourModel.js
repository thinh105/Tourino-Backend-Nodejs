const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        120,
        'A tour name must have less than or equal to 120 characters',
      ],
      minlength: [
        10,
        'A tour name must have more then or equal to 10 characters',
      ],
    },
    slug: { type: String, lowercase: true, unique: true },
    destinations: {
      type: [String],
    },
    duration: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      required: [true, 'A tour must have a duration'],
      validate: {
        validator: (number) => number.isInteger && number > 0,
        message: 'Duration must be a Natural Number',
      },
    },
    travelStyle: {
      type: [String],
      required: [true, 'A tour must have travel styles'],
    },
    rating: {
      type: Number,
      default: 0,
      set: (value) => Math.round(value * 10) / 10, // 4.666666 ~> 46.6666 ~> 47 ~> 4.7
    },
    reviewsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
      validate: {
        validator: (number) => number > 0,
        message: 'Price must be greater than 0',
      },
    },
    oldPrice: {
      type: Number,
      validate: {
        validator(value) {
          // this only points to current doc on NEW document creation
          return value > this.price || value === 0;
        },
        message: 'Old price ({VALUE}) should be higher than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    highlights: {
      type: [String],
      required: [true, 'A tour must have highlight'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image cover'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(), // Mongoose will auto convert to today's date
      select: false,
    },
    startDates: {
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    timeline: [
      {
        title: {
          type: String,
          required: [true, "A timeline must have day's title"],
        },
        description: {
          type: String,
          required: [true, "A timeline must have day's description"],
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // pass the virtuals properties to JSON
    toObject: { virtuals: true }, // --                        -- Object
  }
);

// tourSchema.index({ price: 1 }); // 1 = ascending order | -1 = descending order

// tourSchema.index({ price: 1, rating: -1 }); // compound index

// Virtual populate for show up child referencing
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  const slugName = slugify(this.name, {
    lower: true,
    locale: 'vi',
    remove: /[!"'()*+.:@~]/g,
  });

  const randomString = Math.random().toString(36).slice(8);

  this.slug = `${slugName}-${randomString}`;
  next();
});

// tourSchema.pre('remove', { document: true }, async function (tour) {
//   await Review.deleteOne({ tour: tour._id });
//   console.log('Delete reviews of that deleted tour!!!');
// });

tourSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async function () {
    await this.model('Review').deleteMany({ tour: this._id }); // `this` points to current tour
  }
);

// QUERY MIDDLEWARE
// tourSchema.pre(/^find/, function (next) {
//   this.find({ secretTour: { $ne: true } });

//   this.start = Date.now();
//   next();
// });

// tourSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'guides',
//     select: '-__v -passwordChangedAt -passwordResetExpires -passwordResetToken',
//   });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
