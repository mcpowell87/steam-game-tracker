const got = require('got');
const SteamApiUrls = require('../constants/steamApiUrls');
const cache = require('../util/cache');

/**
 * 
 * @param {int} appId 
 * @returns App Details
 */
const getAppDetails = (appId) => {
    if (!appId) {
        return null;
    }

    return got(SteamApiUrls.AppDetails(appId));
}

/**
 * 
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
 * 
 * @param {string} key Api Key
 * @param {string} steamId Steam ID
 * @returns List of owned games given a steam user.
 */
const getOwnedGames = (key, steamId) => {
    if (!key || !steamId) {
        return null;
    }

    return got(SteamApiUrls.GetOwnedGames(key, steamId));
}

module.exports = {
    getAppDetails,
    getOwnedGames,
    getAppList
}