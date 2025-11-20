import { supabase } from "../../config/database.js";

export interface MessageUser {
    id: string;
    username?: string;
    displayName?: string;
}

export interface MessageRow {
    id: string;
    chatId: string;
    userId: string;
    text: string;
    createdAt: string;
    user: MessageUser | null;
}

export class ChatsService {
    async getUserChats(userId: string) {
        const { data, error } = await supabase
            .from("chats")
            .select(`id, name, participants, createdAt, updatedAt`)
            .contains("participants", [userId])
            .order("updatedAt", { ascending: false });

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        const chatsWithMessages = await Promise.all(
            (data || []).map(async (chat: any) => {
                const lastMessage = await this.getLastMessage(chat.id);
                const unreadCount = await this.getUnreadCount(chat.id, userId);
                return {
                    ...chat,
                    lastMessage: lastMessage?.text || null,
                    lastMessageTime: lastMessage?.createdat || null,
                    unreadCount
                };
            })
        );

        return chatsWithMessages;
    }

    async createChat(userId: string, name: string, participants: string[]) {
        const { data: users } = await supabase.from("users").select("id").in("id", participants);
        if (!users || users.length !== participants.length) {
            const error: any = new Error("One or more participants not found");
            error.statusCode = 400;
            throw error;
        }

        const allParticipants = [...new Set([userId, ...participants])];

        const { data, error } = await supabase
            .from("chats")
            .insert({ name, participants: allParticipants })
            .select()
            .single();

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        const lastMessage = await this.getLastMessage(data.id);
        return {
            ...data,
            lastMessage: lastMessage?.text || null,
            lastMessageTime: lastMessage?.createdat || null,
            unreadCount: 0
        };
    }

    async getChatById(chatId: string, userId: string) {
        const { data, error } = await supabase.from("chats").select("*").eq("id", chatId).single();
        if (error || !data) {
            const err: any = new Error("Chat not found");
            err.statusCode = 404;
            throw err;
        }
        if (!data.participants || !data.participants.includes(userId)) {
            const err: any = new Error("User is not a participant");
            err.statusCode = 403;
            throw err;
        }
        const lastMessage = await this.getLastMessage(chatId);
        const unreadCount = await this.getUnreadCount(chatId, userId);

        return {
            ...data,
            lastMessage: lastMessage?.text || null,
            lastMessageTime: lastMessage?.createdat || null,
            unreadCount
        };
    }

    async getChatMessages(chatId: string, userId: string): Promise<MessageRow[]> {
        const { data: chat } = await supabase.from("chats").select("participants").eq("id", chatId).single();
        if (!chat || !chat.participants || !chat.participants.includes(userId)) {
            const error: any = new Error("Chat not found or user is not a participant");
            error.statusCode = 404;
            throw error;
        }

        const { data, error } = await supabase
            .from("messages")
            .select(`
        id,
        chatid,
        userid,
        text,
        createdat,
        user:userid (
          id,
          username,
          displayname
        )
      `)
            .eq("chatid", chatId)
            .order("createdat", { ascending: true });

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        const rows = (data || []) as any[];

        return rows.map((message): MessageRow => ({
            id: message.id,
            chatId: message.chatId,
            userId: message.userId,
            text: message.text,
            createdAt: message.createdAt ?? new Date().toISOString(),
            user: message.user ?? null
        }));
    }

    async sendMessage(chatId: string, userId: string, text: string) {
        const { data: chat } = await supabase.from("chats").select("participants").eq("id", chatId).single();
        if (!chat || !chat.participants || !chat.participants.includes(userId)) {
            const error: any = new Error("Chat not found or user is not a participant");
            error.statusCode = 404;
            throw error;
        }

        const { data, error } = await supabase
            .from("messages")
            .insert({ chatid: chatId, userid: userId, text })
            .select(`
        id,
        chatid,
        userid,
        text,
        createdat,
        user:userid (
          id,
          username,
          displayname
        )
      `)
            .single();

        if (error) {
            const err: any = new Error(error.message);
            err.statusCode = 400;
            throw err;
        }

        const row = data as any;

        // actualizar updatedAt del chat (si querés también usar trigger DB)
        await supabase.from("chats").update({ updatedAt: new Date().toISOString() }).eq("id", chatId);

        return {
            id: row.id,
            chatId: row.chatId,
            userId: row.userId,
            userName: row.user?.username ?? row.user?.displayName ?? "Unknown",
            text: row.text,
            createdAt: row.createdAt ?? new Date().toISOString()
        };
    }

    private async getLastMessage(chatId: string) {
        const { data } = await supabase.from("messages").select("text, createdat").eq("chatid", chatId)
            .order("createdat", { ascending: false }).limit(1).single();
        return data || null;
    }

    private async getUnreadCount(chatId: string, userId: string): Promise<number> {
        return 0;
    }
}
