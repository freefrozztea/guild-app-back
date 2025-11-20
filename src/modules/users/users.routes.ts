import { Router } from "express";
import { UsersController } from "./users.controller.js";
import { optionalAuth } from "../../middlewares/auth.js";

const controller = new UsersController();
const router = Router();

// Temporal: usando optionalAuth para testing
router.get("/me", optionalAuth, controller.getCurrentUser);
router.put("/me", optionalAuth, controller.updateCurrentUser);
router.get("/:id", optionalAuth, controller.getUserById);

export default router;

