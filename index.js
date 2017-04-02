'use latest';
import bodyParser from 'body-parser';
import express from 'express';
import Webtask from 'webtask-tools';
import { MongoClient } from 'mongodb';
import { ObjectID } from 'mongodb';

const collection = 'expenses';
const server = express();

server.use(bodyParser.json());
server.post('/', (req, res, next) => {
  const { MONGO_URL } = req.webtaskContext.data;
  // TODO: Do data sanitation here.
  const model = {
    source: req.body.originalRequest.source,
    userMessage: req.body.originalRequest.data.message.text,
    vendorId: req.body.id,
    vendorTimestamp: req.body.timestamp,
    botAnswer: req.body.result.fulfillment.speech,
    category: req.body.result.parameters.category,
    title: req.body.result.parameters.expense.join(', '),
    amount: req.body.result.parameters['unit-currency'].amount,
    currency: req.body.result.parameters['unit-currency'].currency
  };
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) return next(err);
    db.collection(collection).insertOne(model, (err, result) => {
      db.close();
      if (err) return next(err);
      res.status(201).send(result);
    });
  });
});

module.exports = Webtask.fromExpress(server);
