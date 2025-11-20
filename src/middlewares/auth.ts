import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: { id: string; email?: string; username?: string };
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid authorization header" });
        }

        const token = authHeader.substring(7);

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: "JWT secret not configured" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
            id: string;
            username: string;
            email: string;
        };

        req.user = { id: decoded.id, email: decoded.email, username: decoded.username };

        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        }
        return res.status(401).json({ error: "Authentication failed" });
    }
};

// Middleware opcional para testing (permite deshabilitar auth temporalmente)
export const optionalAuth = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            const token = authHeader.substring(7);
            if (process.env.JWT_SECRET) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
                    id: string;
                    email: string;
                    username: string;
                };
                req.user = { id: decoded.id, email: decoded.email, username: decoded.username };
            }
        } catch (error) {
            // Ignore auth errors in optional mode
        }
    }

    next();
};

