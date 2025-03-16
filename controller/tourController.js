const AppError = require('../utils/appErrors.js');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures.js');
const catchAsync = require('./../utils/catchAsync.js');
const factory = require('./handlerFactory.js');
exports.aliasTopTour = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTour = factory.getAll(Tour)

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getToursStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: { $gte: 4.5 },
        },
      },
      {
        $group: {
          // _id: null,
          _id: { $toUpper: '$difficulty' },
          numTours: {
            $sum: 1,
          },
          numRatings: {
            $sum: '$ratingsQuantity',
          },
          avgRating: {
            $avg: '$ratingsAverage',
          },
          avgPrice: {
            $avg: '$price',
          },
          minPrice: {
            $min: '$price',
          },
          maxPrice: {
            $max: '$price',
          },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match:{_id:{$ne:"EASY"}}
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        tour: stats,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            $month: '$startDates',
          },
          numTourStarts: {
            $sum: 1,
          },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numTourStarts: -1,
          // month: -1,
        },
      },
      {
        $limit: 6,
      },
    ]);

    res.status(200).json({
      status: 'success',
      total: plan.length,
      data: {
        plan,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
