const express = require('express');
const bookingController = require('./../controller/bookingController');
const authController = require('./../controller/authController.js');

const router = express.Router();

router.get("/checkout-session/:tourId",authController.protect,bookingController.getCheckOutSession)

module.exports = router;
