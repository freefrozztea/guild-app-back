import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.js";
import { UsersService } from "./users.service.js";

const service = new UsersService();

export class UsersController {
    async getCurrentUser(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const user = await service.getCurrentUser(req.user.id);
            res.status(200).json(user);
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async updateCurrentUser(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const { username, email, displayName, fullname, avatarUrl } = req.body;
            const user = await service.updateCurrentUser(req.user.id, {
                username,
                email,
                displayName,
                fullname,
                avatarUrl
            });
            res.status(200).json(user);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }

    async getUserById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "User ID is required" });
            }

            const user = await service.getUserById(id);
            res.status(200).json(user);
        } catch (error: any) {
            const statusCode = error.statusCode || 404;
            res.status(statusCode).json({ error: error.message });
        }
    }
}

