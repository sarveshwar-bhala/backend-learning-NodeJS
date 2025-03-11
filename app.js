const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');

const app = express();

// 1. Middlewares
app.use(morgan('dev'));

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// middleware
// app.use((req, res, next) => {
//   console.log("Hello from the middleware");
//   next();
// });
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Cant't find ${req.originalUrl} on this server`,
  // });

  const err = new Error(`Can't find ${req.originalUrl} on this server`)
  err.status = "fail"
  err.statusCode = 400;
  next(err)
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  req.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
