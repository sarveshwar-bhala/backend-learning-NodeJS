const express = require('express');
const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController.js');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(authController.restrictTo('user'), reviewController.deleteReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  );

module.exports = router;
