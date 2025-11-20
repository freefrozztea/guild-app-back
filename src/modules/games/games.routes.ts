import { Router } from "express";
import { GamesController } from "./games.controller.js";

const controller = new GamesController();
const router = Router();

router.get("/", controller.getAllGames);
router.get("/search", controller.searchGames);
router.get("/new", controller.getNewGames);
router.get("/:id", controller.getGameById);
router.post("/", controller.createGame);

export default router;

