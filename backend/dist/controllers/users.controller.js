"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.removeFavorite = exports.addFavorite = exports.getFavorites = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getFavorites = async (req, res) => {
    const userId = req.user;
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
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
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getFavorites = getFavorites;
const addFavorite = async (req, res) => {
    const { listingId } = req.params;
    const userId = req.user;
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { favoriteListings: true },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const existingFavorite = user.favoriteListings.some((fav) => fav.id === listingId);
        if (existingFavorite) {
            return res.status(400).json({ message: "Already in favorites" });
        }
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                favoriteListings: {
                    connect: [{ id: listingId }],
                },
            },
        });
        res.status(200).json({ message: "Added to favorites" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.addFavorite = addFavorite;
const removeFavorite = async (req, res) => {
    const { listingId } = req.params;
    const userId = req.user;
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { favoriteListings: true },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                favoriteListings: {
                    disconnect: [{ id: listingId }],
                },
            },
        });
        res.status(200).json({ message: "Removed from favorites" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.removeFavorite = removeFavorite;
const getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const [users, total] = await Promise.all([
            prisma_1.default.user.findMany({
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
            prisma_1.default.user.count(),
        ]);
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        res.status(200).json({
            data: users,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: id },
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
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, username, phone, role, avatar, bio } = req.body;
    try {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { id: id },
        });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const user = await prisma_1.default.user.update({
            where: { id: id },
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
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: id },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await prisma_1.default.user.delete({
            where: { id: id },
        });
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteUser = deleteUser;
