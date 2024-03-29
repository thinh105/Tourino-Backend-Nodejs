import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import jsonwebtoken from 'jsonwebtoken';
import User from '../models/userModel.mjs';
import catchAsync from '../utils/catchAsync.mjs';
import AppError from '../utils/appError.mjs';
import sendEmail from '../utils/email.mjs';

const { sign, verify } = jsonwebtoken;

const createAndSendToken = (user, statusCode, response) => {
  const token = sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  response.status(statusCode).json({
    status: 'success',
    data: {
      user: user.toAuthJSON(),
      token,
    },
  });
};

export const signup = catchAsync(async (request, response, next) => {
  // to avoid someone want to take controll by set admin role in req.body
  const { name, email, password, passwordConfirm } = request.body;
  let { photo } = request.body;

  if (!photo) photo = `https://i.pravatar.cc/150?u=${email}`;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    photo,
  });

  createAndSendToken(newUser, 201, response);
});

export const login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  // const { email } = request.body;

  // 1 check if email and password exist
  if (!email || !password)
    return next(new AppError('Please provide email & password!!!', 400));

  // 2 Check if user exits && password is correct
  const user = await User.findOne({ email }).select('+password');

  // {email:email} === {email} in ES6
  // +password because it was hidden in db

  // double check if user and password of that user is correct or not
  // write like that because if no user ~> no user.password ~> function go wrong : Cannot read property 'correctPassword' of null

  // if (!user || !(await user.comparePassword(password, user.password)))
  //   return next(new AppError('Incorect Email or Password!!!', 401));

  if (!user || !(await user.comparePassword(password, user.password)))
    return next(new AppError('Incorect Email or Password!!!', 401));

  // 3 If everything is ok, send token to client
  createAndSendToken(user, 200, response);
});

export const protect = catchAsync(async (request, response, next) => {
  // 1 Getting token and check of it's there
  let token;

  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError(
        'You are not logged in! Please log in to get access!!!',
        401,
      ),
    );

  // 2 Verification token
  const verifiedToken = await promisify(verify)(token, process.env.JWT_SECRET); // promisify(jwt.verify) will return a promise

  // 3 Check if user still exists
  const user = await User.findById(verifiedToken.id);

  if (!user)
    return next(new AppError('This user does no longer exist!!!', 401));

  // 4 Check if user changed password after the token was issued
  if (user.changedPasswordAfterToken(verifiedToken.iat))
    return next(
      new AppError(
        'User has recently changed password! Please log in again to get access!!!',
        401,
      ),
    );

  request.user = user; // tranfer data logged user to the next middleware function

  next();
});

export function restrictTo(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.user.role))
      return next(
        new AppError(
          'You do not have permission to perform this action!!!',
          403,
        ),
      );
    next();
  };
}

export const forgotPassword = catchAsync(async (request, response, next) => {
  // 1 Get user based on POSTed email

  const user = await User.findOne({ email: request.body.email });

  if (!user)
    return next(new AppError('There is no user with email address!!!', 404));

  // 2 Generate the random resetToken

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // turn off the validate because passwordConfirm is null right now

  // 3) Send it to user's email

  const resetURL = `${request.protocol}://${request.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      name: user.name,
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    // turn off the validate because passwordConfirm is null right now

    return next(
      new AppError(
        'There was an error on sending email. Try again later!!!',
        500,
      ),
    );
  }

  createAndSendToken(user, 200, response);
});

export const resetPassword = catchAsync(async (request, response, next) => {
  // 1 Get user based on the token

  // encrypt the plain token user provided
  const hashedToken = createHash('sha256')
    .update(request.params.token)
    .digest('hex');

  // find the user on db
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // check token has not expired
  });
  // 2 if token has not expired and there is user on db, set the new password

  if (!user) next(new AppError('Token is invalid or has expired', 400));

  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetToken = undefined; // reset
  user.passwordResetExpires = undefined; // reset

  await user.save(); // have to user save() to run validator !!!

  // 3 Update changedPasswordAt property for the user
  // do in userModel.js

  // 4 Log the user in, send JWT
  createAndSendToken(user, 200, response);
});

export const updatePassword = catchAsync(async (request, response, next) => {
  // 1 Get user from collection

  const user = await User.findById(request.user.id).select('+password');

  // 2 check if POSTed current password is correct

  if (!(await user.comparePassword(request.body.oldPassword, user.password)))
    return next(new AppError('Incorect Password!!!', 401));

  // 3 if ok, update password
  user.password = request.body.newPassword;
  user.passwordConfirm = request.body.passwordConfirm;

  await user.save();

  // 4 log user in, send JWT
  createAndSendToken(user, 200, response);
});
