const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

exports.signup = catchAsync(async (req, res, next) => {
  // to avoid someone want to take controll by set admin role in req.body
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({ name, email, password, passwordConfirm });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: { name, email } // not send back the password
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1 check if email and password exist

  if (!email || !password)
    return next(new AppError('Please provide email & password!!!', 400));

  // 2 Check if user exits && password is correct

  const user = await User.findOne({ email }).select('+password'); //{email:email} === {email} in ES6 || +password because it was hidden in db

  // double check if user and password of that user is correct or not
  // write like that because if no user ~> no user.password ~> function go wrong : Cannot read property 'correctPassword' of null
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorect Email or Password!!!', 401));

  // 3 If everything is ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1 Getting token and check of it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access!!!', 401)
    );

  // 2 Verification token
  const verifiedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  ); // promisify(jwt.verify) will return a promise

  // 3 Check if user still exists
  const user = await User.findById(verifiedToken.id);

  if (!user)
    return next(new AppError('This user does no longer exist!!!', 401));

  //4 Check if user changed password after the token was issued
  if (user.changedPasswordAfter(verifiedToken.iat))
    return next(
      new AppError(
        'User has recently changed password! Please log in again to get access!!!',
        401
      )
    );

  req.user = user; // tranfer to the next middleware function

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          'You do not have permission to perform this action!!!',
          403
        )
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 Get user based on POSTed email

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError('There is no user with email address!!!', 404));

  // 2 Generate the random resetToken

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // turn off the validate because passwordConfirm is null right now

  // 3) Send it to user's email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error on sending email. Try again later!!!',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!!!'
  });
});
exports.resetPassword = (req, res, next) => {};
