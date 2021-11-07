const got = require('got');
const SteamApiUrls = require('../constants/steamApiUrls');
const cache = require('../util/cache');

const getAppDetails = (appId) => {
    if (!appId) {
        return null;
    }

    return got(SteamApiUrls.AppDetails(appId));
}

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