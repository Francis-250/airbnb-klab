import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getFavorites = async (req: Request, res: Response) => {
  const userId = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      include: {
        favoriteListings: {
          include: {
            _count: {
              select: { bookings: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.favoriteListings);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addFavorite = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const userId = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      include: { favoriteListings: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingFavorite = user.favoriteListings.some(
      (fav) => fav.id === listingId,
    );
    if (existingFavorite) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    await prisma.user.update({
      where: { id: userId as string },
      data: {
        favoriteListings: {
          connect: [{ id: listingId as string }],
        },
      },
    });

    res.status(200).json({ message: "Added to favorites" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const userId = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      include: { favoriteListings: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.update({
      where: { id: userId as string },
      data: {
        favoriteListings: {
          disconnect: [{ id: listingId as string }],
        },
      },
    });

    res.status(200).json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          name: true,
          email: true,
          username: true,
          phone: true,
          role: true,
          avatar: true,
          bio: true,
        },
      }),
      prisma.user.count(),
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        avatar: true,
        bio: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, username, phone, role, avatar, bio } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: id as string },
    });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = await prisma.user.update({
      where: { id: id as string },
      data: {
        name,
        email,
        username,
        phone,
        role,
        avatar,
        bio,
      },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id as string },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await prisma.user.delete({
      where: { id: id as string },
    });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
