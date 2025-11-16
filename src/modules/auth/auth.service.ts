import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../../config/database.js";

export class AuthService {
    async register(email: string, password: string, name: string) {
        const hashed = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from("users")
            .insert({
                email,
                password: hashed,
                name
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data;
    }

    async login(email: string, password: string) {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();
        if (error) throw new Error(error.message);

        const valid = await bcrypt.compare(password, data.password);

        if (!valid) throw new Error("Credenciales incorrectas");

        const token = jwt.sign(
            { id: data.id, email: data.email },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        return {
            user: data,
            token: token
        };
    }
}
