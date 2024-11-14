import { Router } from "express";
import {
  getAppDetails,
  getAppList,
  getOwnedGames,
} from "../controllers/steam.js";
var router = Router();

router.get("/app/:appId", getAppDetails);

router.get("/apps", getAppList);

router.get("/user/:steamId/games", getOwnedGames);

export default router;
