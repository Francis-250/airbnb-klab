import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { getCache, setCache } from "../lib/cache";

export const getUserStats = async (req: Request, res: Response) => {
  const cacheKey = "users:stats";
  const cached = getCache(cacheKey);
  if (cached) return res.status(200).json(cached);

  try {
    const [totalUsers, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    ]);

    const response = { totalUsers, byRole };
    setCache(cacheKey, response, 300);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const userId = req.user;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "host") {
      return res.status(403).json({ message: "Hosts only" });
    }

    const [
      totalListings,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      listings,
      reviews,
    ] = await Promise.all([
      prisma.listing.count({ where: { hostId: userId } }),
      prisma.booking.count({
        where: { listing: { hostId: userId } },
      }),
      prisma.booking.count({
        where: {
          listing: { hostId: userId },
          status: "confirmed",
        },
      }),
      prisma.booking.count({
        where: {
          listing: { hostId: userId },
          status: "pending",
        },
      }),
      prisma.listing.findMany({
        where: { hostId: userId },
        include: {
          _count: {
            select: { bookings: true },
          },
        },
      }),
      prisma.review.findMany({
        where: {
          listing: { hostId: userId },
        },
      }),
    ]);

    const totalRevenue = listings.reduce((sum, listing) => {
      return sum + listing.pricePerNight * listing._count.bookings;
    }, 0);

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    const occupancyRate =
      totalListings > 0
        ? Math.round((confirmedBookings / (totalListings * 30)) * 100)
        : 0;

    const recentBookings = await prisma.booking.findMany({
      where: { listing: { hostId: userId } },
      include: {
        listing: { select: { title: true } },
        guest: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const topListings = listings
      .sort((a, b) => b._count.bookings - a._count.bookings)
      .slice(0, 5);

    const response = {
      totalListings,
      totalBookings,
      totalRevenue,
      averageRating,
      occupancyRate,
      pendingBookings,
      recentBookings,
      topListings,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
