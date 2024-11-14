import { averageDailySpend, bestMonth, averageMonthlySpend, averageYearlySpend, bestDay, bestYear } from './stats.js';
import Purchases from "../models/purchases.js";
import {DateTime} from "luxon";
import { getOwnedGames } from "../api/steam.js";
const dateWithTimeRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g;

export const getPurchasesByDateRange = (steamId, start, end) => {
    let startDate = null;
    let endDate = null;
    const filter = {
        steamId
    };

    if (start) {
        if (start.match(dateWithTimeRegex)) {
            // If the date string contains time, use it
            startDate = DateTime.fromISO(start).setZone('America/New_York').toISO();
        } else {
            // Otherwise set it to start of day
            startDate = DateTime.fromISO(start).setZone('America/New_York').startOf('day').toISO();
        }

	    if (end) {
            if (end.match(dateWithTimeRegex)) {
                endDate = DateTime.fromISO(end).setZone('America/New_York').toISO();
            } else {
                endDate = DateTime.fromISO(end).setZone('America/New_York').endOf('day').toISO();
            }
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

export const searchPurchases = (steamId, name) => {
    const filter = {
        steamId,
        name: { $regex: `${name}`, $options: "i" }
    };

    return Purchases.find(filter).exec().then((purchases) => {
        return purchases || []
    });
}

export const getPurchaseByAppId = (steamId, appId) => {
    const filter = {
        steamId,
        appId
    };

    return Purchases.findOne(filter).exec().then((err, purchase) => {
        if (err) {
            console.error(err);
            throw err;
        }
        return purchase;
    });
}

const toDollars = (price) => {
    return +(price / 100.00).toFixed(2);
}

export const getStats = async (steamId) => {
    const result = await Purchases.aggregate([
        {
            $match: { steamId },
        },
        {
          $facet: {
            avgMonthlySpend: averageMonthlySpend(),
            bestMonth: bestMonth(),
            avgYearlySpend: averageYearlySpend(),
            bestYear: bestYear(),
            avgDailySpend: averageDailySpend(),
            bestDay: bestDay()
          },
        },
      ]);
      const stats = result[0] || {};

      let month = null;

      if (stats.bestMonth?.[0]?.month && stats.bestMonth?.[0]?.year) {
        month = `${stats.bestMonth[0].year}-${stats.bestMonth[0].month}`
      }

      return {
        avgMonthlySpend: stats.avgMonthlySpend?.[0]?.avgMonthlySpend || 0,
        bestMonth: month,
        bestMonthSpend: stats.bestMonth?.[0]?.totalSpend || 0,
        avgYearlySpend: stats.avgYearlySpend?.[0]?.avgYearlySpend || 0,
        bestYear: stats.bestYear?.[0]?.year || null,
        bestYearSpend: stats.bestYear?.[0]?.totalSpend || 0,
        avgDailySpend: stats.avgDailySpend?.[0]?.avgDailySpend || 0,
        bestDay: stats.bestDay?.[0]?.date || null,
        bestDaySpend: stats.bestDay?.[0]?.totalSpend || 0
      };
}

export const calculateStats = async (steamId) => {
    const stats = {
        totalPlaytimeMinutes: 0,
        numberPlayed: 0,
        percentagePlayed: 0,
        numberOwned: 0,
        totalCost: 0.0,
        costPerMinute: 0,
        playedList: []
    };

    const ownedGamesResponse = await getOwnedGames(steamId);
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
    stats.totalCost = toDollars(stats.totalCost);
    stats.costPerMinute = +(stats.totalCost / stats.totalPlaytimeMinutes).toFixed(2);
    stats.percentagePlayed = ((stats.numberPlayed / stats.numberOwned) * 100).toFixed(2);

    const purchaseStats = await getStats(steamId);

    return {
        ...stats,
        ...purchaseStats
    };
}