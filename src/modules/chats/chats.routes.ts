import { Router } from "express";
import { ChatsController } from "./chats.controller.js";
import { optionalAuth, authenticate } from "../../middlewares/auth.js";

const controller = new ChatsController();
const router = Router();

// Temporal: usando optionalAuth para testing (excepto createChat y getChatById que requieren auth)
router.get("/", optionalAuth, controller.getUserChats);
router.post("/", authenticate, controller.createChat);
router.get("/:id", authenticate, controller.getChatById);
router.get("/:id/messages", optionalAuth, controller.getChatMessages);
router.post("/:id/messages", optionalAuth, controller.sendMessage);

export default router;

