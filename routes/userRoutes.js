const express = require('express');
const multer = require("multer")
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  getMe,
} = require('./../controller/userController');

const authController = require('./../controller/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protect all routes after these middlewares
router.use(authController.protect);

router.patch('/update-password', authController.updatePassword);

router.get('/me', getMe, getUser);
router.patch('/update-user-data', updateMe);
router.delete('/delete-user', deleteUser);

router.use(authController.restrictTo("admin"))

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
