const config = require("../config.json");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = `mongodb://${process.env.MONGO_DB}/steamTracking`


module.exports = db;