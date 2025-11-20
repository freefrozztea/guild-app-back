import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.js";
import { FavoritesService } from "./favorites.service.js";

const service = new FavoritesService();

export class FavoritesController {
    async getUserFavorites(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const favorites = await service.getUserFavorites(req.user.id);
            res.status(200).json(favorites);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async addFavorite(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const { gameId } = req.body;

            if (!gameId) {
                return res.status(400).json({ error: "Game ID is required" });
            }

            const favorite = await service.addFavorite(req.user.id, gameId);
            res.status(201).json(favorite);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async removeFavorite(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const { gameId } = req.params;

            if (!gameId) {
                return res.status(400).json({ error: "Game ID is required" });
            }

            await service.removeFavorite(req.user.id, gameId);
            res.status(204).send();
        } catch (error: any) {
            const statusCode = error.statusCode || 404;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async checkFavoriteStatus(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const { gameId } = req.params;

            if (!gameId) {
                return res.status(400).json({ error: "Game ID is required" });
            }

            const status = await service.checkFavoriteStatus(req.user.id, gameId);
            res.status(200).json(status);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }
}

