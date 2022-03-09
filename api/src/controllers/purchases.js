const Purchases = require("../models/purchases");
const DateTime = require("luxon").DateTime;

const get = (req, res) => {
    if (!req.params.steamId) {
        res.status(400).json({ message: "SteamId is required." });
    }

    const filter = {
        steamId: req.params.steamId
    };

    if (req.query.n) {
        filter.name = { $regex: `${req.query.n}`, $options: "i" };
    }

    let startDate = null;
    let endDate = null;

    if (req.query.start) {
        startDate = DateTime.fromISO(req.query.start).setZone('America/New_York').startOf('day').toISO();
        
        if (req.query.end) {
            endDate = DateTime.fromISO(req.query.end).setZone('America/New_York').endOf('day').toISO();
        }
        else {
            endDate = DateTime.fromISO(req.query.start).setZone('America/New_York').endOf('day').toISO();
        }
    }

    if (startDate) {
        try {
            filter.datePurchased = { $gte: startDate, $lte: endDate };
        } catch (error) {
        }
    }

    Purchases.find(filter).exec().then((purchases) => {
        return res.status(200).json(purchases || []);
    })
    .catch(err => {
        return res.status(500).json({error: err})
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
