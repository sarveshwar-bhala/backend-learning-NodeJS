const express = require('express');
const tourController = require('./../controller/tourController.js');
const authController = require("./../controller/authController.js")

const router = express.Router();
// router.param("id",  tourController.checkId);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTour);
router.route('/tour-stats').get(tourController.getToursStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect,tourController.getAllTour)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo("admin","lead-guide"),
    tourController.deleteTour,
  );

module.exports = router;
