const steamRoutes = require('./steam');
const purchasesRoutes = require('./purchases');

var router = require("express").Router();

router.get('/api-status', (req, res) => {
    res.json({
        status: "ok"
    });
});

router.use('/steam', steamRoutes);
router.use('/purchases', purchasesRoutes);

module.exports = router;