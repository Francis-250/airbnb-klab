"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.getListingComments = exports.createComment = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createComment = async (req, res) => {
    const { listingId, body } = req.body;
    const userId = req.user;
    if (!listingId || !body?.trim()) {
        return res
            .status(400)
            .json({ message: "Listing ID and comment are required" });
    }
    try {
        const listing = await prisma_1.default.listing.findUnique({
            where: { id: listingId },
            select: { id: true },
        });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        const comment = await prisma_1.default.comment.create({
            data: {
                body: body.trim(),
                guestId: userId,
                listingId: listingId,
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
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createComment = createComment;
const getListingComments = async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    try {
        const [comments, total] = await Promise.all([
            prisma_1.default.comment.findMany({
                where: { listingId: id },
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
            prisma_1.default.comment.count({ where: { listingId: id } }),
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
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getListingComments = getListingComments;
const deleteComment = async (req, res) => {
    const { id } = req.params;
    const userId = req.user;
    try {
        const comment = await prisma_1.default.comment.findFirst({
            where: { id: id, guestId: userId },
        });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        await prisma_1.default.comment.delete({ where: { id: id } });
        res.status(200).json({ message: "Comment deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteComment = deleteComment;
