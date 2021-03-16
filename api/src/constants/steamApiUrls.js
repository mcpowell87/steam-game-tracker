const SteamApiInterface = require('./steamApiInterfaces');
const Config = require('../config.json');

module.exports = {
    AppDetails: appId => `${Config.steamStoreBaseUrl}/api/appdetails?appids=${appId}&cc=us&l=en`,
    GetOwnedGames: (key, steamId) => `${Config.steamApiBaseUrl}/${SteamApiInterface.IPlayerService}/GetOwnedGames/v0001/?key=${key}&steamid=${steamId}&format=json`,
    GetPlayerSummaries: (key, steamId) => `${Config.steamApiBaseUrl}/${SteamApiInterface.ISteamUser}/GetPlayerSummaries/v0001/?key=${key}&steamid=${steamId}&format=json`,
    GetAppList: () => `${Config.steamApiBaseUrl}/${SteamApiInterface.ISteamApps}/GetAppList/v2/`
}