import mongoose from "mongoose";

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = `mongodb://${process.env.MONGO_DB}/steamTracking`;

export default db;
