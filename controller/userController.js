const fs = require('fs');
const AppError = require('../utils/appErrors');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`),
);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async(req, res) => {
  const user=await User.find()
  res.status(200).json({
    status: 'success',
    results: user.length,
    data: {
      users: user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm | req.body.email) {
    return next(
      new AppError(
        'this route is not for password update. Please use /updateMyPassword.',
        400,
      ),
    );
  }

  // 2. Update user document
  const filteredBody = filterObj(req.body, 'name', 'role');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});
// exports.deleteMe = catchAsync(async (req, res, next) => {
//   // 2. Update user document
//   const updatedUser = await User.findByIdAndDelete(req.user.id);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       updatedUser,
//     },
//   });
// });

exports.getUser = (req, res) => {
  const { id } = req.params;
  if (id > users.length) {
    res.status(400).json({
      status: 'fail',
      message: `Tour with id ${id} not found`,
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tours: users[id],
    },
  });
};

exports.createUser = (req, res) => {
  const newId = users[users.length - 1].id + 1;
  const newUser = Object.assign(
    {
      id: newId,
    },
    req.body,
  );
  users.push(newUser);
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          user: newUser,
        },
      });
    },
  );

  // res.send("Done")
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  if (id > tours.length) {
    return res.status(400).json({
      status: 'fail',
      message: `Tour with id ${id} not found`,
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

exports.deleteUser = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
  });
});
