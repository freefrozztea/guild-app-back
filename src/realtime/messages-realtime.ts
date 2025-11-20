import { supabase } from "../config/database.js";
import { EventEmitter } from "events";

type Payload = any;

class RealtimeManager {
    private channels = new Map<string, any>(); // supabase channel objects
    private emitters = new Map<string, EventEmitter>(); // chatId -> EventEmitter

    // Subscribe to supabase for a chatId (only once)
    subscribe(chatId: string) {
        if (this.channels.has(chatId)) return;

        const emitter = new EventEmitter();
        this.emitters.set(chatId, emitter);

        const channel = supabase
            .channel(`chat:${chatId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "messages", filter: `chatId=eq.${chatId}` },
                (payload: Payload) => {
                    // Emit an event with the payload
                    emitter.emit("message", payload);
                }
            )
            .subscribe();

        this.channels.set(chatId, channel);
        console.log(`Realtime subscribed to chat ${chatId}`);
    }

    // Return emitter for chatId
    getEmitter(chatId: string) {
        if (!this.emitters.has(chatId)) {
            this.subscribe(chatId);
        }
        return this.emitters.get(chatId)!;
    }

    // Optional: unsubscribe when no listeners (not implemented complexly here)
    unsubscribe(chatId: string) {
        const channel = this.channels.get(chatId);
        if (channel) {
            channel.unsubscribe();
            this.channels.delete(chatId);
        }
        this.emitters.delete(chatId);
    }
}

export const realtimeManager = new RealtimeManager();

