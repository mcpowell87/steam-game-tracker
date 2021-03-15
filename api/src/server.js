const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./models");
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
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

app.use('/api', routes)

const PORT = process.env.PORT || 30000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});