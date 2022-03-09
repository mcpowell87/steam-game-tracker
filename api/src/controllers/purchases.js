const Purchases = require("../models/purchases");

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
        startDate = new Date(req.query.start);
        //startDate.setDate(startDate.getUTCDate());
        startDate = new Date(startDate.setHours(0,0,0,0));
        
        if (req.query.end) {
            endDate = new Date(req.query.end);
            //endDate.setDate(endDate.getUTCDate());
            endDate = new Date(endDate.setHours(23,59,59,999));
        }
        else {
            endDate = new Date(req.query.start);
            //endDate.setDate(endDate.getUTCDate());
            endDate = new Date(endDate.setHours(23,59,59,999));
        }
    }

    if (startDate) {
        try {
            filter.datePurchased = { $gte: startDate.toISOString(), $lte: endDate.toISOString() };
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