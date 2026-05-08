import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createReview = async (req: Request, res: Response) => {
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
    const existingReview = await prisma.review.findFirst({
      where: {
        guestId: userId as string,
        listingId: listingId as string,
      },
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this listing" });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        guestId: userId as string,
        listingId: listingId as string,
        status: "confirmed",
        checkOut: { lt: new Date() },
      },
    });

    if (!booking) {
      return res
        .status(400)
        .json({ message: "You must have completed a stay to review" });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        guestId: userId as string,
        listingId: listingId as string,
      },
      include: {
        guest: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    const allReviews = await prisma.review.findMany({
      where: { listingId: listingId as string },
      select: { rating: true },
    });

    const averageRating =
      allReviews.reduce((sum, review) => sum + review.rating, 0) /
      allReviews.length;

    await prisma.listing.update({
      where: { id: listingId as string },
      data: { rating: averageRating },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getListingReviews = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const reviews = await prisma.review.findMany({
      where: { listingId: id as string },
      include: {
        guest: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.review.count({
      where: { listingId: id as string },
    });

    const ratingCounts = await prisma.review.groupBy({
      by: ["rating"],
      where: { listingId: id as string },
      _count: { rating: true },
    });

    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count:
        ratingCounts.find((rc) => rc.rating === rating)?._count.rating || 0,
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
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user;

  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const review = await prisma.review.findFirst({
      where: { id: id as string, guestId: userId as string },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const updatedReview = await prisma.review.update({
      where: { id: id as string },
      data: { rating, comment },
      include: {
        guest: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    const allReviews = await prisma.review.findMany({
      where: { listingId: review.listingId },
      select: { rating: true },
    });

    const averageRating =
      allReviews.reduce((sum, review) => sum + review.rating, 0) /
      allReviews.length;

    await prisma.listing.update({
      where: { id: review.listingId },
      data: { rating: averageRating },
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user;

  try {
    const review = await prisma.review.findFirst({
      where: { id: id as string, guestId: userId as string },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await prisma.review.delete({
      where: { id: id as string },
    });

    const remainingReviews = await prisma.review.findMany({
      where: { listingId: review.listingId },
      select: { rating: true },
    });

    if (remainingReviews.length > 0) {
      const averageRating =
        remainingReviews.reduce((sum, review) => sum + review.rating, 0) /
        remainingReviews.length;
      await prisma.listing.update({
        where: { id: review.listingId },
        data: { rating: averageRating },
      });
    } else {
      await prisma.listing.update({
        where: { id: review.listingId },
        data: { rating: null },
      });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
