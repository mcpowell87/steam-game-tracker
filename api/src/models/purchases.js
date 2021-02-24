const mongoose = require("mongoose");

const purchasesSchema = new mongoose.Schema([{
    steamId: {
        type: String,
        required: true
    },
    appId: {
        type: Number,
        required: true
    },
    name: String,
    type: String,
    headerImage: String,
    developers: String,
    publishers: String,
    price: Number,
    priceFormatted: String,
    datePurchased: Date
}]);

const Purchases = mongoose.model("Purchases", purchasesSchema);

module.exports = Purchases;