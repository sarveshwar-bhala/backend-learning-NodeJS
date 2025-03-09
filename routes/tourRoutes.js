const express = require('express');
const tourController = require('./../controller/tourController.js');

const router = express.Router();
// router.param("id",  tourController.checkId);

router.route('/top-5-cheap').get(tourController.aliasTopTour,tourController.getAllTour);
router.route('/getTourStats').get(tourController.getToursStats);

router
  .route('/')
  .get(tourController.getAllTour)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
