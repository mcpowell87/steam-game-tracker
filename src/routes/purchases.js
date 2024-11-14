import { Router } from "express";
import {get, stats, create} from "../controllers/purchases.js";
var router = Router();

router.get("/:steamId", get);

router.get("/:steamId/stats", stats);

router.post("/", create);

export default router;
