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
