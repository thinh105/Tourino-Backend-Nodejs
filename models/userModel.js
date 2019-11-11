const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [20, 'A name must have less than 21 characters!!!'],
    minlength: [5, 'A name must have more than 4 characters!!!']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email!!!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!!!']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password!!!'],
    minlength: [8, 'A password must have more than 7 characters!!!'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please comfirm a password!!!'],
    validate: {
      validator: function(el) {
        //this only works on SAVE not Update!!!!
        //whenever we want to update a user
        //we will always have to use SAVE not FindOneAndUpdate
        return el === this.password;
      },
      message: 'Passwords are not the same!!!'
    }
  },
  passwordChangedAt: Date
});

//pre-middleware on save
// the encryption is then gonna be happened between the moment that we receive that data and the moment
// where it's actually persisted to the database

userSchema.pre('save', async function(next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //hash the password with cost of 13
  this.password = await bcrypt.hash(this.password, 13);

  //delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// an instance medthod to check password correct or not

userSchema.methods.correctPassword = async (candidatePassword, userPassword) =>
  await bcrypt.compare(candidatePassword, userPassword);

// an instance method to check Password changed after Token issued or not

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp; // TRUE = Changed = Password was changed AFTER token was issued
  }

  return false; // NOT changed
};

//Create User collection

const User = mongoose.model('User', userSchema);
module.exports = User;
