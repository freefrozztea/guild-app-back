import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

const service = new AuthService();

export class AuthController {
    register = async (req: Request, res: Response) => {
        try {
            const { email, password, username, fullname } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ error: "Username, email, and password are required" });
            }

            const result = await service.register({
                email,
                password,
                username,
                fullname
            });
            res.status(201).json(result);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }

     login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }

            const result = await service.login(email, password);
            res.status(200).json(result);
        } catch (error: any) {
            const statusCode = error.statusCode || 400;
            res.status(statusCode).json({ error: error.message });
        }
    }
}
