const got = require('got');
const SteamApiUrls = require('../constants/steamApiUrls');

const getAppDetails = (appId) => {
    if (!appId) {
        return null;
    }

    return got(SteamApiUrls.AppDetails(appId));
}

const getAppList = () => {
    return got(SteamApiUrls.GetAppList())
    .then(response => {
        const body = JSON.parse(response.body);
        const apps = body.applist.apps.reduce((acc, cur) => {
            acc[cur.appid] = cur.name;
            return acc;
        }, {});
        Promise.resolve(apps);
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