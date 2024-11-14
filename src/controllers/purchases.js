import Purchases from "../models/purchases.js";
import {
    getPurchasesByDateRange,
    searchPurchases,
    calculateStats,
    getPurchaseByAppId
} from "../helpers/purchases.js";

export const get = async (req, res) => {
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

export const stats = async (req, res) => {
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

export const create = async (req, res) => {
    if (!req.body.purchases || req.body.purchases.length == 0) {
        res.status(400).json({ message: "Purchases is required." });
        return;
    }

    const purchases = new Purchases(req.body.purchases);

    const errors = purchases.validateSync();

    if (errors && errors.length > 0) {
        res.status(400).json({ message: "Input has one or more errors.", errors});
        return;
    }

    // Check for dupes first
    const exists = await getPurchaseByAppId(purchases.steamId, purchases.appId);
    if (exists) {
        res.status(409).json({ message: `AppId '${purchases.appId}' already found in the database`});
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