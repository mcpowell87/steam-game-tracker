const express = require('express');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const cors = require('cors');
const getNewGamesForUser = require('./scripts/getNewGamesForUser');
const PurchaseProcessor = require('./util/purchaseProcessor');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const purchaseProcessor = new PurchaseProcessor([process.env.STEAM_ID]);

if (process.env.DEBUG) {
  console.debug("Using env variables:");
  const env = Object.keys(process.env).map(k => {
    return `${k}: ${process.env[k]}`;
  });
  console.debug(env.join('\n'));
}

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined'))

const db = require("./models");

app.use('/api', routes)

const PORT = process.env.PORT || 30000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    db.mongoose
    .connect(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASS,
      authSource: "admin"
    })
    .then(() => {
      console.log("Connected to the database!");
      if (!process.env.API_ONLY) {
        purchaseProcessor.start();
      }
    })
    .catch(err => {
      console.log("Cannot connect to the database!", err);
      process.exit();
    });
});