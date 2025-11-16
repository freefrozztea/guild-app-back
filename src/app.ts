import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
//import userRoutes from "./modules/users/users.routes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
//app.use("/users", userRoutes);

// Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
