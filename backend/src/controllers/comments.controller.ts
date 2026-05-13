import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createComment = async (req: Request, res: Response) => {
  const { listingId, body } = req.body;
  const userId = req.user;

  if (!listingId || !body?.trim()) {
    return res
      .status(400)
      .json({ message: "Listing ID and comment are required" });
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId as string },
      select: { id: true },
    });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        body: body.trim(),
        guestId: userId as string,
        listingId: listingId as string,
      },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getListingComments = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  try {
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { listingId: id as string },
        include: {
          guest: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { listingId: id as string } }),
    ]);

    res.status(200).json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user;

  try {
    const comment = await prisma.comment.findFirst({
      where: { id: id as string, guestId: userId as string },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await prisma.comment.delete({ where: { id: id as string } });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
