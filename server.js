const mongoose = require('mongoose');
const dotenv = require('dotenv');
process.on('unhandledException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED EXCEPTION 💥 Shutting down....');
  process.exit(1);
});

dotenv.config({
  path: './config.env',
});
const app = require('./app');
const { name } = require('eslint-config-prettier/flat');
const { rules } = require('eslint-config-airbnb');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then((con) => {
  // console.log(con.connections);
  console.log('DB connection successful');
});

const PORT = process.env.PORT || 6000;
const server = app.listen(PORT, () => {
  console.log('server running on port', PORT);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION 💥 Shutting down....');
  server.close(() => {
    process.exit(1);
  });
});
