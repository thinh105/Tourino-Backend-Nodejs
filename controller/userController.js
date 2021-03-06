const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handler = require('../utils/handlerFactory');

exports.getAllUsers = handler.getAll(User);
exports.getUser = handler.getOne(User);
exports.updateUser = handler.updateOne(User); // Do not update Password with this
exports.deleteUser = handler.deleteOne(User);

exports.getMe = (request, response, next) => {
  request.params.id = request.user.id;
  next();
};

exports.getRoleAndCount = handler.getDistinctValueAndCount(User, 'role');

exports.updateMe = catchAsync(async (request, response, next) => {
  const allowedFields = ['name', 'email', 'photo'];

  // 1 Create error if user POSTs unwanted fields names that are not allowed to be updated

  Object.keys(request.body).forEach((element) => {
    if (!allowedFields.includes(element))
      return next(
        new AppError(
          `This route is used just for update ${allowedFields}!!! Please try again!!!`,
          400
        )
      );
  });

  // 2 Update User data

  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    request.body, // filteredReqBody,
    {
      new: true, //  true to return the modified document rather than the original.
      runValidators: true, //  runs update validators on this command.
      // Update validators validate the update operation against the model's schema.
    }
  );

  response.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(200).json({
    status: 'success',
  });
});
