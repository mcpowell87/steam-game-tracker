const mongoose = require("mongoose");
mongoose.set('useCreateIndex', true);

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
    developers: [String],
    publishers: [String],
    price: Number,
    priceFormatted: String,
    datePurchased: Date
}]);

purchasesSchema.index({
    steamId: 1,
    appId: 1,
},
{
    unique: true,
    dropDupes: true
});

const Purchases = mongoose.model("Purchases", purchasesSchema);

module.exports = Purchases;