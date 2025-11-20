import { Router } from "express";
import { FavoritesController } from "./favorites.controller.js";
import { optionalAuth } from "../../middlewares/auth.js";

const controller = new FavoritesController();
const router = Router();

// Temporal: usando optionalAuth para testing
router.get("/", optionalAuth, controller.getUserFavorites);
router.post("/", optionalAuth, controller.addFavorite);
router.delete("/:gameId", optionalAuth, controller.removeFavorite);
router.get("/:gameId/status", optionalAuth, controller.checkFavoriteStatus);

export default router;

