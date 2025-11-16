import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

const service = new AuthService();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { email, password, name } = req.body;
            const result = await service.register(email, password, name);
            res.status(202).json({ ok: true, result });
        } catch (error: any) {
            res.status(400).json({ ok: false, error: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await service.login(email, password);
            res.json({ ok: true, result });
        } catch (error: any) {
            res.status(400).json({ ok: false, error: error.message });
        }
    }
}
