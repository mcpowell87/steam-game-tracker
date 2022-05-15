const got = require('got');
const SteamApiUrls = require('../constants/steamApiUrls');
const cache = require('../util/cache');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Returns the app details given a app id.
 * @param {int} appId App ID to get
 * @param {bool} ignoreCache Force retrieval of fresh data
 * @returns App Details
 */
const getAppDetails = (appId, ignoreCache=false) => {
    if (!appId) {
        return null;
    }

    const cached = cache.get(appId);
    if (cached && !ignoreCache) {
        return Promise.resolve(cached);
    }

    return got(SteamApiUrls.AppDetails(appId))
    .then(response => {
        const body = JSON.parse(response.body);
        cache.set(appId, body);
        return Promise.resolve(body);
    });
}

/**
 * Returns the master list of apps from steam.
 * @param {bool} ignoreCache Force retrieval of fresh data
 * @returns Gets the list of apps.
 */
const getAppList = (ignoreCache=false) => {
    const cached = cache.get('apps');
    if (cached && !ignoreCache) {
        return Promise.resolve(cached);
    }
    return got(SteamApiUrls.GetAppList())
    .then(response => {
        const body = JSON.parse(response.body);
        const apps = body.applist.apps.reduce((acc, cur) => {
            acc[cur.appid] = cur.name;
            return acc;
        }, {});
        cache.set('apps', apps);
        return Promise.resolve(apps);
    });
}

/**
 * Gets a list of owned games for a steam user.
 * @param {string} key Api Key
 * @param {string} steamId Steam ID
 * @returns List of owned games given a steam user.
 */
const getOwnedGames = (steamId) => {
    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey || !steamId) {
        return null;
    }

    return got(SteamApiUrls.GetOwnedGames(apiKey, steamId));
}

module.exports = {
    getAppDetails,
    getOwnedGames,
    getAppList
}
