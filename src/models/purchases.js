import mongoose from "mongoose";
import timezone from "mongoose-timezone";
mongoose.set("useCreateIndex", true);

const purchasesSchema = new mongoose.Schema([
  {
    steamId: {
      type: String,
      required: true,
    },
    appId: {
      type: Number,
      required: true,
    },
    removed: Boolean,
    name: String,
    type: String,
    headerImage: String,
    developers: [String],
    publishers: [String],
    price: Number,
    priceFormatted: String,
    datePurchased: {
      type: Date,
      required: true,
    },
  },
]);

purchasesSchema.index(
  {
    steamId: 1,
    appId: 1,
  },
  {
    unique: true,
    dropDupes: true,
  },
);

purchasesSchema.plugin(timezone, { paths: ["datePurchased"] });

const Purchases = mongoose.model("Purchases", purchasesSchema);

export default Purchases;
