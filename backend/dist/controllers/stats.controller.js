"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getUserStats = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const cache_1 = require("../lib/cache");
const getUserStats = async (req, res) => {
    const cacheKey = "users:stats";
    const cached = (0, cache_1.getCache)(cacheKey);
    if (cached)
        return res.status(200).json(cached);
    try {
        const [totalUsers, byRole] = await Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.user.groupBy({ by: ["role"], _count: { role: true } }),
        ]);
        const response = { totalUsers, byRole };
        (0, cache_1.setCache)(cacheKey, response, 300);
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getUserStats = getUserStats;
const getDashboardStats = async (req, res) => {
    const userId = req.user;
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== "host") {
            return res.status(403).json({ message: "Hosts only" });
        }
        const [totalListings, totalBookings, confirmedBookings, pendingBookings, listings, reviews,] = await Promise.all([
            prisma_1.default.listing.count({ where: { hostId: userId } }),
            prisma_1.default.booking.count({
                where: { listing: { hostId: userId } },
            }),
            prisma_1.default.booking.count({
                where: {
                    listing: { hostId: userId },
                    status: "confirmed",
                },
            }),
            prisma_1.default.booking.count({
                where: {
                    listing: { hostId: userId },
                    status: "pending",
                },
            }),
            prisma_1.default.listing.findMany({
                where: { hostId: userId },
                include: {
                    _count: {
                        select: { bookings: true },
                    },
                },
            }),
            prisma_1.default.review.findMany({
                where: {
                    listing: { hostId: userId },
                },
            }),
        ]);
        const totalRevenue = listings.reduce((sum, listing) => {
            return sum + listing.pricePerNight * listing._count.bookings;
        }, 0);
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                reviews.length
            : 0;
        const occupancyRate = totalListings > 0
            ? Math.round((confirmedBookings / (totalListings * 30)) * 100)
            : 0;
        const recentBookings = await prisma_1.default.booking.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getDashboardStats = getDashboardStats;
