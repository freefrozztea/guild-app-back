import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    PORT: process.env.PORT || 3000,
    DB_URL: process.env.DB_URL!,
    DB_ANON_KEY: process.env.DB_ANON_KEY!,
    JWT_SECRET: process.env.JWT_SECRET!,
};