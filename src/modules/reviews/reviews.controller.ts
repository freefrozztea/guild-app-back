import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.js";
import { ReviewsService } from "./reviews.service.js";

const service = new ReviewsService();

export class ReviewsController {
    async getReviewsByGame(req: AuthRequest, res: Response) {
        try {
            const { gameId } = req.params;

            if (!gameId) {
                return res.status(400).json({ error: "Game ID is required" });
            }

            const reviews = await service.getReviewsByGame(gameId);
            res.status(200).json(reviews);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async createReview(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const { gameId, text, rating } = req.body;

            if (!gameId || !text || rating === undefined) {
                return res.status(400).json({ error: "Game ID, text, and rating are required" });
            }

            const review = await service.createReview(req.user.id, gameId, text, rating);
            res.status(201).json(review);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async updateReview(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const { id } = req.params;
            const { text, rating } = req.body;

            if (!id) {
                return res.status(400).json({ error: "Review ID is required" });
            }

            const review = await service.updateReview(id, req.user.id, { text, rating });
            res.status(200).json(review);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async deleteReview(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Review ID is required" });
            }

            await service.deleteReview(id, req.user.id);
            res.status(204).send();
        } catch (error: any) {
            const statusCode = error.statusCode || 404;
            res.status(statusCode).json({ error: error.message });
        }
    }
}

