const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const AppError = require('./../utils/appErrors');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    //   secure: true,
    httpOnly: true,
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // This code has few security flaws as we are sending all the data without checking
  // const newUser = await User.create(req.body);

  // Updated query
  const { name, email, password, passwordConfirm, passwordChangedAt } =
    req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1. Check if email and password exist
  if (!email || !password) {
    next(new AppError('Please provide email and password', 400));
  }

  // 2. Check if user exist and password is correct
  const userExist = await User.findOne({ email }).select('+password');
  if (
    !userExist ||
    !(await userExist.correctPassword(password, userExist.password))
  ) {
    next(new AppError('Incorrect email or password', 401));
  }

  // 3. If everything ok, send token to client
  createSendToken(userExist, 201, res);

  //   const token = signToken(userExist._id);

  //   res.status(200).json({
  //     status: 'success',
  //     token,
  //   });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1. Getting token and check of it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  //   console.log(token);
  // 2. Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //   console.log(decoded);
  // 3. Check if user still exist
  const userExist = await User.findById(decoded.id);
  if (!userExist) {
    return next(new AppError('User does not exist.', 401));
  }
  // 4. check if user changed the password after the token wa issued
  console.log('time changed', userExist.changedPasswordAfter(decoded.iat));
  if (userExist.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again.', 401),
    );
  }
  console.log(userExist);
  req.user = userExist;
  console.log(req.user);
  next();
});
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  console.log('📩 Forgot Password Request Received');

  // 1. Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }

  // 2. Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  console.log('🔑 Reset Token Created:', resetToken);

  // 3. Set it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

  try {
    console.log('📨 Sending email to:', user.email);
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending an email. Try again later!',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2. If token has not expired, and there is user, seth the new user
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });
  // 3. Update changedPasswordAt property for user
  // 4. Log the user in, send jwt
  createSendToken(user, 200, res);

  //   const token = signToken(user._id);

  //   res.status(200).json({
  //     status: 'success',
  //     token,
  //   });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { email, password, newPassword, newPasswordConfirm } = req.body;
  // 1. GET user from collection
  const user = await User.findOne({ email }).select('+password');
  console.log(user);
  if (!user) {
    next(new AppError('Email does not exist', 401));
  }
  // 2. Check if posted current password is corret
  const passwordCheck = await user.correctPassword(password, user.password);
  console.log('password check is', passwordCheck);
  if (!passwordCheck) {
    next(new AppError('Incorrect password', 401));
  }

  // 3. If so, update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  // 4. log user in, send JWT
  createSendToken(user, 200, res);

  //   const token = signToken(user._id);

  //   res.status(200).json({
  //     status: 'success',
  //     token,
  //   });
});
