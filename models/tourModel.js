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
        80,
        'A tour name must have less than or equal to 80 characters',
      ],
      minlength: [
        8,
        'A tour name must have more then or equal to 8 characters',
      ],
    },
    slug: String,
    duration: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      required: [true, 'A tour must have a duration'],
      validate: {
        validator: (num) => num.isInteger && num > 0,
        message: 'Duration must be a Natural Number',
      },
    },
    tagList: {
      type: [String],
      required: [true, 'A tour must have tags'],
    },
    ratingsAverage: {
      type: Number,
      default: 3,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666666 ~> 46.6666 ~> 47 ~> 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
      validate: {
        validator: (num) => num > 0,
        message: 'Price must be greater than 0',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image cover'],
    },
    images: [{ src: String, text: String }],
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
        day: {
          type: Number,
          required: [true, "A timeline must have day's number"],
        },
        title: {
          type: String,
          required: [true, "A timeline must have day's title"],
        },
        description: {
          type: [String],
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

tourSchema.index({ price: 1, ratingsAverage: -1 }); // compound index

// Virtual populate for show up child referencing
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  // generate random String at the end of Slug
  this.slug = `${slugify(this.name, { lower: true })}-${Math.random()
    .toString(36)
    .substring(8)}`;
  next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -passwordResetExpires -passwordResetToken',
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
