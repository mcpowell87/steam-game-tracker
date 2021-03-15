const SteamApi = require('../api/steam');

const getAppDetails = async (req, res) => {
    // ToDo: I think I should queue this since steam has a 200 limit per 5 minutes.
    if (!req.params.appId) {
        res.status(400).json({ message: "AppId is required." });
        return;
    }

    try {
        const response = await SteamApi.getAppDetails(req.params.appId);
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
        const response = await SteamApi.getOwnedGames(req.params.steamId, req.query.key);
        res.status(200).json(response.body);
    } catch (error) {
        res.status(500).json({ error });
    }
}

module.exports = {
    getAppDetails,
    getOwnedGames
}