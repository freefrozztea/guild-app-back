import { Request, Response } from "express";
import { ChatsService } from "./chats.service.js";
import { realtimeManager } from "../../realtime/messages-realtime.js";
import { AuthRequest } from "../../middlewares/auth.js";

const service = new ChatsService();

export class ChatsController {
    getUserChats = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user!.id;
            const chats = await service.getUserChats(userId);
            res.json({ ok: true, chats });
        } catch (err: any) {
            res.status(err.statusCode || 400).json({ ok: false, error: err.message });
        }
    };

    createChat = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user!.id;
            const { name, participants } = req.body;
            const chat = await service.createChat(userId, name, participants || []);
            res.json({ ok: true, chat });
        } catch (err: any) {
            res.status(err.statusCode || 400).json({ ok: false, error: err.message });
        }
    };

    getChatById = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user!.id;
            const chatId = req.params.id;
            const chat = await service.getChatById(chatId, userId);
            res.json({ ok: true, chat });
        } catch (err: any) {
            res.status(err.statusCode || 400).json({ ok: false, error: err.message });
        }
    };

    getChatMessages = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user!.id;
            const chatId = req.params.id;
            const messages = await service.getChatMessages(chatId, userId);
            res.json({ ok: true, messages });
        } catch (err: any) {
            res.status(err.statusCode || 400).json({ ok: false, error: err.message });
        }
    };

    sendMessage = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user!.id;
            const chatId = req.params.id;
            const { text } = req.body;
            const message = await service.sendMessage(chatId, userId, text);
            res.json({ ok: true, message });
        } catch (err: any) {
            res.status(err.statusCode || 400).json({ ok: false, error: err.message });
        }
    };

    stream = (req: AuthRequest, res: Response) => {
        const userId = req.user!.id;
        const chatId = req.params.id;

        service.getChatById(chatId, userId).catch((err) => {
            res.status(403).json({ ok: false, error: "Forbidden" });
        });

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();

        const emitter = realtimeManager.getEmitter(chatId);

        const onEvent = (payload: any) => {
            // Map payload to a small event
            const event = {
                type: payload.eventType || payload.type || "unknown",
                op: payload.event || payload.type || null,
                new: payload.new ?? null,
                old: payload.old ?? null
            };
            res.write(`data: ${JSON.stringify(event)}\n\n`);
        };

        emitter.on("message", onEvent);

        // Send initial comment to keep connection alive
        res.write(`:connected\n\n`);

        // When client closes connection
        req.on("close", () => {
            emitter.off("message", onEvent);
        });
    };
}
