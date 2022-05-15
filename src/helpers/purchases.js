const Purchases = require('../models/purchases');
const DateTime = require('luxon').DateTime;
const SteamApi = require('../api/steam');

const getPurchasesByDateRange = (steamId, start, end) => {
    let startDate = null;
    let endDate = null;
    const filter = {
        steamId
    };

    if (start) {
        startDate = DateTime.fromISO(start).setZone('America/New_York').startOf('day').toISO();

	if (end) {
            endDate = DateTime.fromISO(end).setZone('America/New_York').endOf('day').toISO();
        }
        else {
            endDate = DateTime.fromISO(start).setZone('America/New_York').endOf('day').toISO();
        }
    }

    if (startDate) {
        try {
            filter.datePurchased = { $gte: startDate, $lte: endDate };
        } catch (error) {
        }
    }

    return Purchases.find(filter).exec().then((purchases) => {
        return purchases || [];
    })
}

const searchPurchases = (steamId, name) => {
    const filter = {
        steamId,
        name: { $regex: `${name}`, $options: "i" }
    };

    return Purchases.find(filter).exec().then((purchases) => {
        return purchases || []
    });
}

const calculateStats = async (steamId) => {
    const stats = {
        totalPlaytimeMinutes: 0,
        numberPlayed: 0,
        percentagePlayed: 0,
        numberOwned: 0,
        totalCost: 0.0,
        costPerMinute: 0,
        playedList: [],
        /*avgMonthlySpend: 0.0,
        avgMonthlyBuy: 0,
        avgYearlySpend: 0.0,
        avgYearlyBuy: 0,
        avgDailySpend: 0.0,
        avgDailyBuy: 0,*/
    };

    const ownedGamesResponse = await SteamApi.getOwnedGames(steamId);
    const ownedGames = JSON.parse(ownedGamesResponse.body);
    const ownedDict = ownedGames.response.games.reduce((result, game) => {
        result[game.appid] = game;
        return result;
    }, {});
    const purchases = await getPurchasesByDateRange(steamId);

    stats.numberOwned = purchases.length;

    for (let i = 0; i < purchases.length; i++) {
        if (Number.isInteger(purchases[i].price)) {
            stats.totalCost += purchases[i].price;
        }
        const appId = purchases[i].appId;
        if (ownedDict[appId] && ownedDict[appId].playtime_forever > 0) {
            stats.numberPlayed += 1;
            const purchase = purchases[i].toObject();
            purchase.totalPlaytimeMinutes = ownedDict[appId].playtime_forever;
            stats.playedList.push(purchase);
            stats.totalPlaytimeMinutes += ownedDict[appId].playtime_forever;
        }
    }
    // We don't really care too much about precision. 
    stats.totalCost = +(stats.totalCost / 100.00).toFixed(2);
    stats.costPerMinute = +(stats.totalCost / stats.totalPlaytimeMinutes).toFixed(2);
    stats.percentagePlayed = ((stats.numberPlayed / stats.numberOwned) * 100).toFixed(2);

    return stats;
}

module.exports = {
    getPurchasesByDateRange,
    searchPurchases,
    calculateStats
};
