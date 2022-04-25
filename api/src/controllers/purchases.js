const Purchases = require("../models/purchases");
const {
    getPurchasesByDateRange,
    searchPurchases,
    calculateStats
} = require('../helpers/purchases');

const get = async (req, res) => {
    if (!req.params.steamId) {
        return res.status(400).json({ message: "SteamId is required." });
    }
    let purchases = [];
    try {
        if (req.query.n) {
            purchases = await searchPurchases(req.params.steamId, req.query.n)
        } else {
            purchases = await getPurchasesByDateRange(req.params.steamId, req.query.start, req.query.end)
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(purchases);
}

const stats = async (req, res) => {
    if (!req.params.steamId) {
        return res.status(400).json({ message: "SteamID is required." });
    }

    try {
        const stats = await calculateStats(req.params.steamId);
        return res.status(200).json(stats);
    } catch (error) {
        console.error(error.message);
        console.error(error);
        return res.status(500).json({ error: "There was a problem while processing statistics." });
    }
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
        return res.status(500).json({ error: err.message });
    });
}

module.exports = {
    get,
    create,
    stats
};
