import express from 'express';
import logger from 'morgan';

const assetRouter = require('./routes/api/assets');
const hdTicketRouter = require('./routes/api/hdTickets');
const usersRouter = require('./routes/api/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use('/api/Assets', assetRouter);
app.use('/api/HdTickets', hdTicketRouter);
app.use('/api/Users', usersRouter);

module.exports = app;
