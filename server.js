const mongoose = require('mongoose');
const dotenv = require('dotenv');
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

app.listen(PORT, () => {
  console.log('server running on port', PORT);
});
