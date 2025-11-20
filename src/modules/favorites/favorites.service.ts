import { supabase } from "../../config/database.js";

export class FavoritesService {
    async getUserFavorites(userId: string) {
        const { data, error } = await supabase
            .from("favorites")
            .select(`
                id,
                userId,
                gameId,
                createdAt,
                games:gameId (
                    id,
                    title,
                    description,
                    images,
                    ratingValue,
                    reviewsCount,
                    releaseDate,
                    developerPublisher,
                    platforms,
                    genres,
                    createdAt,
                    updatedAt
                )
            `)
            .eq("userId", userId)
            .order("createdAt", { ascending: false });

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        return (data || []).map(fav => this.formatFavoriteResponse(fav));
    }

    async addFavorite(userId: string, gameId: string) {
        // Verificar que el juego existe
        const { data: game } = await supabase
            .from("games")
            .select("id")
            .eq("id", gameId)
            .single();

        if (!game) {
            const error: any = new Error("Game not found");
            error.statusCode = 404;
            throw error;
        }

        // Verificar si ya está en favoritos
        const { data: existing } = await supabase
            .from("favorites")
            .select("id")
            .eq("userId", userId)
            .eq("gameId", gameId)
            .single();

        if (existing) {
            const error: any = new Error("Game already in favorites");
            error.statusCode = 404;
            throw error;
        }

        const { data, error } = await supabase
            .from("favorites")
            .insert({
                userId,
                gameId
            })
            .select(`
                id,
                userId,
                gameId,
                createdAt,
                games:gameId (
                    id,
                    title,
                    description,
                    images,
                    ratingValue,
                    reviewsCount,
                    releaseDate,
                    developerPublisher,
                    platforms,
                    genres,
                    createdAt,
                    updatedAt
                )
            `)
            .single();

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        return this.formatFavoriteResponse(data);
    }

    async removeFavorite(userId: string, gameId: string) {
        const { data, error } = await supabase
            .from("favorites")
            .delete()
            .eq("userId", userId)
            .eq("gameId", gameId)
            .select()
            .single();

        if (error || !data) {
            const err: any = new Error("Favorite not found");
            err.statusCode = 404;
            throw err;
        }
    }

    async checkFavoriteStatus(userId: string, gameId: string) {
        const { data, error } = await supabase
            .from("favorites")
            .select("id")
            .eq("userId", userId)
            .eq("gameId", gameId)
            .single();

        if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        return {
            isFavorite: !!data
        };
    }

    private formatFavoriteResponse(favorite: any) {
        const game = favorite.games || {};
        return {
            id: favorite.id,
            userId: favorite.userId,
            gameId: favorite.gameId,
            game: {
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
            },
            createdAt: favorite.createdAt || new Date().toISOString()
        };
    }
}

