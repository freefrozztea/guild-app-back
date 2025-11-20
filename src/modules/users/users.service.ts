import { supabase } from "../../config/database.js";

export class UsersService {
    async getCurrentUser(userId: string) {
        const { data, error } = await supabase
            .from("users")
            .select("id, username, email, displayName, fullname, avatarUrl, createdAt, updatedAt")
            .eq("id", userId)
            .single();

        if (error || !data) {
            const err: any = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }

        return this.formatUserResponse(data);
    }

    async updateCurrentUser(userId: string, updates: {
        username?: string;
        email?: string;
        displayName?: string;
        fullname?: string;
        avatarUrl?: string;
    }) {
        // Si se actualiza email o username, verificar que no existan
        if (updates.email) {
            const { data: existingEmail } = await supabase
                .from("users")
                .select("id")
                .eq("email", updates.email)
                .neq("id", userId)
                .single();

            if (existingEmail) {
                const error: any = new Error("Email already exists");
                error.statusCode = 409;
                throw error;
            }
        }

        if (updates.username) {
            const { data: existingUsername } = await supabase
                .from("users")
                .select("id")
                .eq("username", updates.username)
                .neq("id", userId)
                .single();

            if (existingUsername) {
                const error: any = new Error("Username already exists");
                error.statusCode = 409;
                throw error;
            }
        }

        const { data, error } = await supabase
            .from("users")
            .update({
                ...updates,
                updatedAt: new Date().toISOString()
            })
            .eq("id", userId)
            .select("id, username, email, displayName, fullname, avatarUrl, createdAt, updatedAt")
            .single();

        if (error || !data) {
            const err: any = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }

        return this.formatUserResponse(data);
    }

    async getUserById(userId: string) {
        const { data, error } = await supabase
            .from("users")
            .select("id, username, email, displayName, fullname, avatarUrl, createdAt, updatedAt")
            .eq("id", userId)
            .single();

        if (error || !data) {
            const err: any = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }

        return this.formatUserResponse(data);
    }

    private formatUserResponse(user: any) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            fullname: user.fullname,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || new Date().toISOString()
        };
    }
}

