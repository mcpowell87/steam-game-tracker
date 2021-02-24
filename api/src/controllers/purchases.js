const Purchases = require("../models/purchases");

const get = async (req, res) => {
    if (!req.params.steamId) {
        res.status(400).json({ message: "SteamId is required." });
    }
    var purchases = await Purchases.find({steamId: req.params.steamId}).exec()
    .catch(err => {
        res.status(500).json({error: err})
    });
    
    return res.status(200).json(purchases);
}

const create = async (req, res) => {
    if (!req.params.purchases || req.params.purchases.length == 0) {
        res.status(400).json({ message: "Purchases is required." });
        return;
    }

    const purchases = new Purchases(req.body);

    const errors = purchases.validateSync();

    if (errors && errors.length > 0) {
        res.status(400).json({ message: "Input has one or more errors.", errors});
        return;
    }

    await Purchases.insertMany(req.body)
    .catch(err => {
        res.status(500).json({error: err})
    });

    return res.status(200);
}

module.exports = {
    get,
    create
};