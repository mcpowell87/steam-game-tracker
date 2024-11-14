import steamRoutes from "./steam.js";
import purchasesRoutes from "./purchases.js";
import { Router } from "express";
var router = Router();

router.get('/api-status', (req, res) => {
    res.json({
        status: "ok"
    });
});

router.use('/steam', steamRoutes);
router.use('/purchases', purchasesRoutes);

export default router;