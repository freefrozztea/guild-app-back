import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/users.routes.js";
import gamesRoutes from "./modules/games/games.routes.js";
import reviewsRoutes from "./modules/reviews/reviews.routes.js";
import favoritesRoutes from "./modules/favorites/favorites.routes.js";
import chatsRoutes from "./modules/chats/chats.routes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import {optionalAuth} from "./middlewares/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

// API Routes - Base URL: /api/v1
app.use("/api/v1/auth", optionalAuth, authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/games", gamesRoutes);
app.use("/api/v1/reviews", reviewsRoutes);
app.use("/api/v1/favorites", favoritesRoutes);
app.use("/api/v1/chats", chatsRoutes);

// Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
