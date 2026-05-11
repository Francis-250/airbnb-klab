import { Request, Response } from "express";
import prisma from "../lib/prisma";

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
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  },
};

const getConversationForUser = async (conversationId: string, userId: string) =>
  prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ guestId: userId }, { hostId: userId }],
    },
  });

export const createOrGetConversation = async (req: Request, res: Response) => {
  const userId = req.user;
  const { listingId, message } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!listingId) {
    return res.status(400).json({ message: "Listing is required" });
  }

  try {
    const listing = await prisma.listing.findUnique({
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

    const conversation = await prisma.conversation.upsert({
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
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          body: trimmedMessage,
        },
      });
    }

    res.status(200).json({ conversation });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  const userId = req.user;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ guestId: userId }, { hostId: userId }] },
      orderBy: { updatedAt: "desc" },
      include: conversationInclude,
    });

    res.status(200).json({ data: conversations });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const userId = req.user;
  const conversationId = String(req.params.id);

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const conversation = await getConversationForUser(conversationId, userId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    res.status(200).json({ data: messages });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const userId = req.user;
  const conversationId = String(req.params.id);
  const { body } = req.body;
  const messageBody = typeof body === "string" ? body.trim() : "";

  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!messageBody) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  try {
    const conversation = await getConversationForUser(conversationId, userId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        body: messageBody,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
