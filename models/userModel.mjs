import { randomBytes, createHash } from 'node:crypto';
import { Schema, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [20, 'A name must have less than 21 characters!!!'],
    minlength: [5, 'A name must have more than 4 characters!!!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email!!!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!!!'],
    uniqueCaseInsensitive: true,
  },
  photo: {
    type: String,
    default() {
      return `https://i.pravatar.cc/150?u=${this.email}`;
    },
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'trn-admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!!!'],
    minlength: [8, 'A password must have more than 7 characters!!!'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please comfirm a password!!!'],
    validate: {
      // this only works on CREATE and SAVE not Update!!!!
      // whenever we want to update a user
      // we will always have to use SAVE not FindOneAndUpdate
      validator(element) {
        return element === this.password;
      },
      message: 'Passwords are not the same!!!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.plugin(uniqueValidator, {
  message: '💥 Error, {VALUE} is already taken!!! 💥',
});

// ------------ ENCRYPTION PASSWORD ------------
// pre-middleware on save
// the encryption is then gonna be happened
// between the moment that we receive that data
// and the moment where it's actually persisted to the database

// Need to be turn off when import old database

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // hash the password with cost of 13
  this.password = await bcrypt.hash(this.password, 13);

  // delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

//  ---------- Update changedPasswordAt property for the user ------------
// Need to be turn off when import old database
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  // do not using arrow function
  // because Arrow functions explicitly prevent binding this,
  // so your method will not have access to the document

  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.toAuthJSON = function () {
  return {
    name: this.name,
    email: this.email,
    photo: this.photo,
    role: this.role,
  };
};

// ------------ an instance medthod to check password correct or not ------------
userSchema.methods.comparePassword = async (
  candidatePassword,
  userPassword,
) => {
  const result = await bcrypt.compare(candidatePassword, userPassword);
  return result;
};

// ------------ an instance method to check Password changed after Token issued or not ------------
userSchema.methods.changedPasswordAfterToken = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Number.parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp; // TRUE = Changed = Password was changed AFTER token was issued
  }

  return false; // NOT changed
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = randomBytes(32).toString('hex'); // plain text reset token send to user

  this.passwordResetToken = createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // (valid for 10 minutes)
  return resetToken;
};

// Create User collection
const User = model('User', userSchema);
export default User;
