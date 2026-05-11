"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getMessages = exports.getConversations = exports.createOrGetConversation = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const conversationInclude = {
    guest: { select: { id: true, name: true, email: true, avatar: true } },
    host: { select: { id: true, name: true, email: true, avatar: true } },
    listing: {
        select: {
            id: true,
            title: true,
            location: true,
            photos: true,
            hostId: true,
        },
    },
    messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
            sender: { select: { id: true, name: true, avatar: true } },
        },
    },
};
const getConversationForUser = async (conversationId, userId) => prisma_1.default.conversation.findFirst({
    where: {
        id: conversationId,
        OR: [{ guestId: userId }, { hostId: userId }],
    },
});
const createOrGetConversation = async (req, res) => {
    const userId = req.user;
    const { listingId, message } = req.body;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    if (!listingId) {
        return res.status(400).json({ message: "Listing is required" });
    }
    try {
        const listing = await prisma_1.default.listing.findUnique({
            where: { id: listingId },
            select: { id: true, hostId: true },
        });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        if (listing.hostId === userId) {
            return res
                .status(400)
                .json({ message: "You cannot message yourself about your listing" });
        }
        const conversation = await prisma_1.default.conversation.upsert({
            where: {
                guestId_hostId_listingId: {
                    guestId: userId,
                    hostId: listing.hostId,
                    listingId: listing.id,
                },
            },
            update: {},
            create: {
                guestId: userId,
                hostId: listing.hostId,
                listingId: listing.id,
            },
            include: conversationInclude,
        });
        const trimmedMessage = typeof message === "string" ? message.trim() : "";
        if (trimmedMessage) {
            await prisma_1.default.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: userId,
                    body: trimmedMessage,
                },
            });
        }
        res.status(200).json({ conversation });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createOrGetConversation = createOrGetConversation;
const getConversations = async (req, res) => {
    const userId = req.user;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const conversations = await prisma_1.default.conversation.findMany({
            where: { OR: [{ guestId: userId }, { hostId: userId }] },
            orderBy: { updatedAt: "desc" },
            include: conversationInclude,
        });
        res.status(200).json({ data: conversations });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getConversations = getConversations;
const getMessages = async (req, res) => {
    const userId = req.user;
    const conversationId = String(req.params.id);
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const conversation = await getConversationForUser(conversationId, userId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        const messages = await prisma_1.default.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
            },
        });
        await prisma_1.default.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                readAt: null,
            },
            data: { readAt: new Date() },
        });
        res.status(200).json({ data: messages });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res) => {
    const userId = req.user;
    const conversationId = String(req.params.id);
    const { body } = req.body;
    const messageBody = typeof body === "string" ? body.trim() : "";
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    if (!messageBody) {
        return res.status(400).json({ message: "Message cannot be empty" });
    }
    try {
        const conversation = await getConversationForUser(conversationId, userId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        const message = await prisma_1.default.message.create({
            data: {
                conversationId,
                senderId: userId,
                body: messageBody,
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
            },
        });
        await prisma_1.default.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
        res.status(201).json({ message });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.sendMessage = sendMessage;
