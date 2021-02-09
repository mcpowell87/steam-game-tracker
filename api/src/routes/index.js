const steamRoutes = require('./steam');

var router = require("express").Router();

router.get('/api-status', (req, res) => {
    res.json({
        status: "ok"
    });
});

router.use('/steam', steamRoutes);

module.exports = router;