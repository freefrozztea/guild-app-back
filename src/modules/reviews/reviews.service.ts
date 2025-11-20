import { supabase } from "../../config/database.js";

export class ReviewsService {
    async getReviewsByGame(gameId: string) {
        const { data, error } = await supabase
            .from("reviews")
            .select(`
                id,
                gameId,
                userId,
                text,
                rating,
                createdAt,
                updatedAt,
                users:userId (
                    id,
                    username,
                    displayName,
                    avatarUrl
                )
            `)
            .eq("gameId", gameId)
            .order("createdAt", { ascending: false });

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        return (data || []).map(review => this.formatReviewResponse(review));
    }

    async createReview(userId: string, gameId: string, text: string, rating: number) {
        // Validar rating
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            const error: any = new Error("Rating must be an integer between 1 and 5");
            error.statusCode = 400;
            throw error;
        }

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

        // Verificar si el usuario ya tiene una review para este juego
        const { data: existingReview } = await supabase
            .from("reviews")
            .select("id")
            .eq("userId", userId)
            .eq("gameId", gameId)
            .single();

        if (existingReview) {
            const error: any = new Error("User already has a review for this game");
            error.statusCode = 400;
            throw error;
        }

        const { data, error } = await supabase
            .from("reviews")
            .insert({
                userId,
                gameId,
                text,
                rating
            })
            .select(`
                id,
                gameId,
                userId,
                text,
                rating,
                createdAt,
                updatedAt,
                users:userId (
                    id,
                    username,
                    displayName,
                    avatarUrl
                )
            `)
            .single();

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        // Actualizar rating del juego
        await this.updateGameRating(gameId);

        return this.formatReviewResponse(data);
    }

    async updateReview(reviewId: string, userId: string, updates: { text?: string; rating?: number }) {
        // Verificar que la review existe y pertenece al usuario
        const { data: review, error: fetchError } = await supabase
            .from("reviews")
            .select("id, userId, gameId")
            .eq("id", reviewId)
            .single();

        if (fetchError || !review) {
            const error: any = new Error("Review not found");
            error.statusCode = 404;
            throw error;
        }

        if (review.userId !== userId) {
            const error: any = new Error("Unauthorized");
            error.statusCode = 403;
            throw error;
        }

        // Validar rating si se actualiza
        if (updates.rating !== undefined) {
            if (updates.rating < 1 || updates.rating > 5 || !Number.isInteger(updates.rating)) {
                const error: any = new Error("Rating must be an integer between 1 and 5");
                error.statusCode = 400;
                throw error;
            }
        }

        const { data, error } = await supabase
            .from("reviews")
            .update({
                ...updates,
                updatedAt: new Date().toISOString()
            })
            .eq("id", reviewId)
            .select(`
                id,
                gameId,
                userId,
                text,
                rating,
                createdAt,
                updatedAt,
                users:userId (
                    id,
                    username,
                    displayName,
                    avatarUrl
                )
            `)
            .single();

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        // Actualizar rating del juego
        await this.updateGameRating(review.gameId);

        return this.formatReviewResponse(data);
    }

    async deleteReview(reviewId: string, userId: string) {
        // Verificar que la review existe y pertenece al usuario
        const { data: review, error: fetchError } = await supabase
            .from("reviews")
            .select("id, userId, gameId")
            .eq("id", reviewId)
            .single();

        if (fetchError || !review) {
            const error: any = new Error("Review not found");
            error.statusCode = 404;
            throw error;
        }

        if (review.userId !== userId) {
            const error: any = new Error("Unauthorized");
            error.statusCode = 403;
            throw error;
        }

        const { error } = await supabase
            .from("reviews")
            .delete()
            .eq("id", reviewId);

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        // Actualizar rating del juego
        await this.updateGameRating(review.gameId);
    }

    private async updateGameRating(gameId: string) {
        // Calcular nuevo rating promedio
        const { data: reviews } = await supabase
            .from("reviews")
            .select("rating")
            .eq("gameId", gameId);

        if (reviews && reviews.length > 0) {
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRating / reviews.length;

            await supabase
                .from("games")
                .update({
                    ratingValue: averageRating,
                    reviewsCount: reviews.length
                })
                .eq("id", gameId);
        } else {
            await supabase
                .from("games")
                .update({
                    ratingValue: 0.0,
                    reviewsCount: 0
                })
                .eq("id", gameId);
        }
    }

    private formatReviewResponse(review: any) {
        const user = review.users || {};
        return {
            id: review.id,
            gameId: review.gameId,
            userId: review.userId,
            userName: user.displayName || user.username || "Unknown",
            handle: user.username || "unknown",
            avatarUrl: user.avatarUrl,
            text: review.text,
            rating: review.rating,
            createdAt: review.createdAt || new Date().toISOString(),
            updatedAt: review.updatedAt || new Date().toISOString()
        };
    }
}

