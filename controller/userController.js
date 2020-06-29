const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); // Do not update Password with this
exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const allowedFields = ['name', 'email'];

  // 1 Create error if user POSTs unwanted fields names that are not allowed to be updated

  Object.keys(req.body).forEach((el) => {
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
    req.body, // filteredReqBody,
    {
      new: true, //  true to return the modified document rather than the original.
      runValidators: true, //  runs update validators on this command.
      // Update validators validate the update operation against the model's schema.
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
