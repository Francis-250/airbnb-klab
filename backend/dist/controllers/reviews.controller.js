"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.getListingReviews = exports.createReview = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createReview = async (req, res) => {
    const { listingId, rating, comment } = req.body;
    const userId = req.user;
    if (!listingId || !rating || !comment) {
        return res
            .status(400)
            .json({ message: "Listing ID, rating, and comment are required" });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    try {
        const existingReview = await prisma_1.default.review.findFirst({
            where: {
                guestId: userId,
                listingId: listingId,
            },
        });
        if (existingReview) {
            return res
                .status(400)
                .json({ message: "You have already reviewed this listing" });
        }
        const booking = await prisma_1.default.booking.findFirst({
            where: {
                guestId: userId,
                listingId: listingId,
                status: "confirmed",
                checkOut: { lt: new Date() },
            },
        });
        if (!booking) {
            return res
                .status(400)
                .json({ message: "You must have completed a stay to review" });
        }
        const review = await prisma_1.default.review.create({
            data: {
                rating,
                comment,
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
        const allReviews = await prisma_1.default.review.findMany({
            where: { listingId: listingId },
            select: { rating: true },
        });
        const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) /
            allReviews.length;
        await prisma_1.default.listing.update({
            where: { id: listingId },
            data: { rating: averageRating },
        });
        res.status(201).json(review);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createReview = createReview;
const getListingReviews = async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const reviews = await prisma_1.default.review.findMany({
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
        });
        const total = await prisma_1.default.review.count({
            where: { listingId: id },
        });
        const ratingCounts = await prisma_1.default.review.groupBy({
            by: ["rating"],
            where: { listingId: id },
            _count: { rating: true },
        });
        const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
            rating,
            count: ratingCounts.find((rc) => rc.rating === rating)?._count.rating || 0,
        }));
        res.status(200).json({
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            ratingDistribution,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getListingReviews = getListingReviews;
const updateReview = async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user;
    if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    try {
        const review = await prisma_1.default.review.findFirst({
            where: { id: id, guestId: userId },
        });
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        const updatedReview = await prisma_1.default.review.update({
            where: { id: id },
            data: { rating, comment },
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
        const allReviews = await prisma_1.default.review.findMany({
            where: { listingId: review.listingId },
            select: { rating: true },
        });
        const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) /
            allReviews.length;
        await prisma_1.default.listing.update({
            where: { id: review.listingId },
            data: { rating: averageRating },
        });
        res.status(200).json(updatedReview);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res) => {
    const { id } = req.params;
    const userId = req.user;
    try {
        const review = await prisma_1.default.review.findFirst({
            where: { id: id, guestId: userId },
        });
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        await prisma_1.default.review.delete({
            where: { id: id },
        });
        const remainingReviews = await prisma_1.default.review.findMany({
            where: { listingId: review.listingId },
            select: { rating: true },
        });
        if (remainingReviews.length > 0) {
            const averageRating = remainingReviews.reduce((sum, review) => sum + review.rating, 0) /
                remainingReviews.length;
            await prisma_1.default.listing.update({
                where: { id: review.listingId },
                data: { rating: averageRating },
            });
        }
        else {
            await prisma_1.default.listing.update({
                where: { id: review.listingId },
                data: { rating: null },
            });
        }
        res.status(200).json({ message: "Review deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteReview = deleteReview;
