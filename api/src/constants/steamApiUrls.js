module.exports = {
    AppDetails: appId => `http://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`,
    GetOwnedGames: (key, steamId) => `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${steamId}&format=json`,
    GetPlayerSummaries: (key, steamId) => `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0001/?key=${key}&steamid=${steamId}&format=json`,
    GetAppList: () => `http://api.steampowered.com/ISteamApps/GetAppList/v2/`
}