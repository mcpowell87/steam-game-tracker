const Purchases = require("../models/purchases");

const get = (req, res) => {
    if (!req.params.steamId) {
        res.status(400).json({ message: "SteamId is required." });
    }
    Purchases.find({steamId: req.params.steamId}).exec().then((purchases) => {
        return res.status(200).json(purchases || []);
    })
    .catch(err => {
        res.status(500).json({error: err})
    });
    
    
}

const create = (req, res) => {
    if (!req.body.purchases || req.body.purchases.length == 0) {
        res.status(400).json({ message: "Purchases is required." });
        return;
    }

    const purchases = new Purchases();

    const errors = purchases.validateSync();

    if (errors && errors.length > 0) {
        res.status(400).json({ message: "Input has one or more errors.", errors});
        return;
    }

    Purchases.insertMany(req.body.purchases)
    .then(() => {
        return res.status(200).json({success: true});
    })
    .catch(err => {
        return res.status(500).json({error: err});
    });
}

module.exports = {
    get,
    create
};