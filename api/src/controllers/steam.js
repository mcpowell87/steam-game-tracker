const got = require('got');
const SteamApi = require('../constants/steamApiUrls');

const getAppDetails = async (req, res) => {
    // ToDo: I think I should queue this since steam has a 200 limit per 5 minutes.
    if (!req.params.appId) {
        res.status(400).json({ message: "AppId is required." });
        return;
    }

    try {
        const response = await got(SteamApi.AppDetails(req.params.appId));
        res.status(200).json(response.body);
    } catch (error) {
        res.status(500).json({ error });
    }
}

const getOwnedGames = async (req, res) => {
    if (!req.query.key || !req.params.steamId) {
        res.status(400).json({ message: "Key and SteamId are required."} );
        return;
    }

    try {
        const response = await got(SteamApi.GetOwnedGames(req.query.key, req.params.steamId));
        res.status(200).json(response.body);
    } catch (error) {
        res.status(500).json({ error });
    }
}

module.exports = {
    getAppDetails,
    getOwnedGames
}