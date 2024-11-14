import got from "got";
import SteamApiUrls from "../constants/steamApiUrls.js";
import cache from "../util/cache.js";

/**
 * Returns the app details given a app id.
 * @param {int} appId App ID to get
 * @param {bool} ignoreCache Force retrieval of fresh data
 * @returns App Details
 */
export const getAppDetails = (appId, ignoreCache = false) => {
  if (!appId) {
    return null;
  }

  const cached = cache.get(appId);
  if (cached && !ignoreCache) {
    return Promise.resolve(cached);
  }

  return got(SteamApiUrls.AppDetails(appId)).then((response) => {
    const body = JSON.parse(response.body);
    cache.set(appId, body);
    return Promise.resolve(body);
  });
};

/**
 * Returns the master list of apps from steam.
 * @param {bool} ignoreCache Force retrieval of fresh data
 * @returns Gets the list of apps.
 */
export const getAppList = (ignoreCache = false) => {
  const cached = cache.get("apps");
  if (cached && !ignoreCache) {
    return Promise.resolve(cached);
  }
  return got(SteamApiUrls.GetAppList()).then((response) => {
    const body = JSON.parse(response.body);
    const apps = body.applist.apps.reduce((acc, cur) => {
      acc[cur.appid] = cur.name;
      return acc;
    }, {});
    cache.set("apps", apps);
    return Promise.resolve(apps);
  });
};

/**
 * Gets a list of owned games for a steam user.
 * @param {string} key Api Key
 * @param {string} steamId Steam ID
 * @returns List of owned games given a steam user.
 */
export const getOwnedGames = (steamId) => {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey || !steamId) {
    return null;
  }

  return got(SteamApiUrls.GetOwnedGames(apiKey, steamId));
};
