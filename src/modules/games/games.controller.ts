import { Request, Response } from "express";
import { GamesService } from "./games.service.js";

const service = new GamesService();

export class GamesController {
    async getAllGames(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;

            const games = await service.getAllGames(limit, offset);
            res.status(200).json(games);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async getGameById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Game ID is required" });
            }

            const game = await service.getGameById(id);
            res.status(200).json(game);
        } catch (error: any) {
            const statusCode = error.statusCode || 404;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async createGame(req: Request, res: Response) {
        try {
            const { title, description, images, releaseDate, developerPublisher, platforms, genres } = req.body;

            if (!title || !images || !Array.isArray(images)) {
                return res.status(400).json({ error: "Title and images array are required" });
            }

            const game = await service.createGame({
                title,
                description,
                images,
                releaseDate,
                developerPublisher,
                platforms,
                genres
            });

            res.status(201).json(game);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async searchGames(req: Request, res: Response) {
        try {
            const query = req.query.q as string;

            if (!query) {
                return res.status(400).json({ error: "Search query is required" });
            }

            const games = await service.searchGames(query);
            res.status(200).json(games);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async getNewGames(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 10;

            const games = await service.getNewGames(limit);
            res.status(200).json(games);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }
}

