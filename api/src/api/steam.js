const got = require('got');
const SteamApiUrls = require('../constants/steamApiUrls');

const getAppDetails = (appId) => {
    if (!appId) {
        return null;
    }

    return got(SteamApiUrls.AppDetails(appId));
}

const getOwnedGames = (key, steamId) => {
    if (!key || !steamId) {
        return null;
    }

    return got(SteamApiUrls.GetOwnedGames(key, steamId));
}

module.exports = {
    getAppDetails,
    getOwnedGames
}