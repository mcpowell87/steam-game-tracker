
var router = require("express").Router();
var steamController = require('../controllers/steam');

router.get("/app/:appId", steamController.getAppDetails);

router.get('/user/:steamId/games', steamController.getOwnedGames);

module.exports = router;