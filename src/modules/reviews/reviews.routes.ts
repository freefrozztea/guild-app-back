import { Router } from "express";
import { ReviewsController } from "./reviews.controller.js";
import { optionalAuth } from "../../middlewares/auth.js";

const controller = new ReviewsController();
const router = Router();

// Temporal: usando optionalAuth para testing
router.get("/games/:gameId", optionalAuth, controller.getReviewsByGame);
router.post("/", optionalAuth, controller.createReview);
router.put("/:id", optionalAuth, controller.updateReview);
router.delete("/:id", optionalAuth, controller.deleteReview);

export default router;

