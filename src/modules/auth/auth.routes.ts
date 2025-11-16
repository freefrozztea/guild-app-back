import { Router } from "express";
import { AuthController } from "./auth.controller.js";

const controller = new AuthController();
const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);

export default router;
