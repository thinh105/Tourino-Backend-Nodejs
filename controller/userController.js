const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    result: users.length,
    data: { users }
  });
});
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError('No User found with that ID!!!', 404));

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const allowedFields = ['name', 'email'];

  // 1 Create error if user POSTs unwanted fields names that are not allowed to be updated

  Object.keys(req.body).forEach(el => {
    if (!allowedFields.includes(el))
      return next(
        new AppError(
          `This route is used just for update ${allowedFields}!!! Please try again!!!`,
          400
        )
      );
  });

  // 2 Update User data

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    req.body, //filteredReqBody,
    {
      new: true, //  true to return the modified document rather than the original.
      runValidators: true //  runs update validators on this command.
      // Update validators validate the update operation against the model's schema.
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: 'success',
    data: null
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id, {
    new: true,
    runValidators: true
  });

  if (!user) return next(new AppError('No User found with that ID!!!', 404));

  user.set(req.body);
  user.save();

  res.status(200).json({
    status: 'success',
    dataUpdate: { user }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) return next(new AppError('No user found with that ID!!!', 404));

  // in RESTful API, common practice is not send anything back to client when deleted
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet!'
  });
};
