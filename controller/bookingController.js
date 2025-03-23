const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getCheckOutSession = catchAsync(async (req, res, next) => {
  // 1. Get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2. Create checkout session
  stripe.checkout.session.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${res / get('host')}/`,
    cancel_url: `${req.protocol}://${res / get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`http://localhost:8000/img/tour/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // 3. Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});
