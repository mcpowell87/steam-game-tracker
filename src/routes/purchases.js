
var router = require("express").Router();
var purchasesController = require('../controllers/purchases');

router.get("/:steamId", purchasesController.get);

router.get("/:steamId/stats", purchasesController.stats);

router.post("/", purchasesController.create);

module.exports = router;
