import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../../config/database.js";

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    displayname?: string;
    fullname?: string;
    avatarUrl?: string;
}

export interface UserResponse {
    id: string;
    username: string;
    email: string;
    displayname: string | null;
    fullname: string | null;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export class AuthService {
    async register(data: RegisterData){
        const { data: existingEmail } = await supabase
            .from("users")
            .select("id")
            .eq("email", data.email)
            .single();

        if (existingEmail) {
            const error: any = new Error("Email already exists");
            error.statusCode = 409;
            throw error;
        }

        const { data: existingUsername } = await supabase
            .from("users")
            .select("id")
            .eq("username", data.username)
            .single();

        if (existingUsername) {
            const error: any = new Error("Username already exists");
            error.statusCode = 409;
            throw error;
        }

        const hashed = await bcrypt.hash(data.password, 10);

        const { data: user, error } = await supabase
            .from("users")
            .insert({
                email: data.email,
                password: hashed,
                username: data.username,
                fullname: data.fullname,
            })
            .select("id, username, email, fullname")
            .single();

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: "2h" }
        );

        return {
            token,
            user: this.formatUserResponse(user)
        };
    }

    async login(email: string, password: string) {
        const { data: user, error } = await supabase
            .from("users")
            .select("id, username, email, password, displayname, fullname")
            .eq("email", email)
            .single();
        if (error || !user) {
            const err: any = new Error("Invalid credentials");
            err.statusCode = 401;
            throw err;
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            const err: any = new Error("Invalid credentials");
            err.statusCode = 401;
            throw err;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: "2h" }
        );

        const { password: _, ...userWithoutPassword } = user;

        return {
            user: this.formatUserResponse(userWithoutPassword),
            token: token
        };
    }

    private formatUserResponse(user: any): UserResponse {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            displayname: user.displayname,
            fullname: user.fullname,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || new Date().toISOString()
        };
    }
}
