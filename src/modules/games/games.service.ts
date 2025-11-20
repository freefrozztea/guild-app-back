import { supabase } from "../../config/database.js";

export class GamesService {
    async getAllGames(limit: number = 20, offset: number = 0) {
        const { data, error } = await supabase
            .from("games")
            .select("*")
            .order("createdAt", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        return (data || []).map(game => this.formatGameResponse(game));
    }

    async getGameById(id: string) {
        const { data, error } = await supabase
            .from("games")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            const err: any = new Error("Game not found");
            err.statusCode = 404;
            throw err;
        }

        return this.formatGameResponse(data);
    }

    async createGame(gameData: {
        title: string;
        description?: string;
        images: string[];
        releaseDate?: string;
        developerPublisher?: string;
        platforms?: string;
        genres?: string;
    }) {
        const { data, error } = await supabase
            .from("games")
            .insert({
                ...gameData,
                ratingValue: 0.0,
                reviewsCount: 0
            })
            .select()
            .single();

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        return this.formatGameResponse(data);
    }

    async searchGames(query: string) {
        const { data, error } = await supabase
            .from("games")
            .select("*")
            .ilike("title", `%${query}%`)
            .order("createdAt", { ascending: false });

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        return (data || []).map(game => this.formatGameResponse(game));
    }

    async getNewGames(limit: number = 10) {
        const { data, error } = await supabase
            .from("games")
            .select("*")
            .not("releaseDate", "is", null)
            .order("releaseDate", { ascending: false })
            .limit(limit);

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        return (data || []).map(game => this.formatGameResponse(game));
    }

    private formatGameResponse(game: any) {
        return {
            id: game.id,
            title: game.title,
            description: game.description,
            images: Array.isArray(game.images) ? game.images : (game.images ? [game.images] : []),
            ratingValue: game.ratingValue || 0.0,
            reviewsCount: game.reviewsCount || 0,
            releaseDate: game.releaseDate,
            developerPublisher: game.developerPublisher,
            platforms: game.platforms,
            genres: game.genres,
            createdAt: game.createdAt || new Date().toISOString(),
            updatedAt: game.updatedAt || new Date().toISOString()
        };
    }
}

