import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    PORT: process.env.PORT || 3000,
    DB_URL: process.env.SUPABASE_URL!,
    DB_ANON_KEY: process.env.SUPABASE_KEY!,
};