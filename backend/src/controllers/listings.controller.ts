import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { uploadListingPhotos as uploadListingPhotosHelper } from "../lib/helpers";
import { deleteCacheByPrefix, getCache, setCache } from "../lib/cache";

export const getAllListings = async (req: Request, res: Response) => {
  try {
    const listings = await prisma.listing.findMany({
      include: { host: { select: { name: true, email: true } } },
    });
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyListings = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const user = req.user;
  const role = req.role;

  const cacheKey = `listings:all:page:${page}:limit:${limit}:user:${user}:role:${role}`;
  const cached = getCache(cacheKey);
  if (cached) return res.status(200).json(cached);

  try {
    const where = role === "host" ? { hostId: user } : {};
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        include: { host: { select: { name: true, email: true } } },
      }),
      prisma.listing.count({ where }),
    ]);

    const response = {
      data: listings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    setCache(cacheKey, response, 60);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getListingById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: id as string },
      include: { host: { select: { name: true, email: true, avatar: true } } },
    });
    if (listing) {
      res.status(200).json({ listing });
    } else {
      res.status(404).json({ message: "Listing not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createListing = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const {
      title,
      description,
      location,
      pricePerNight,
      guests,
      type,
      amenities,
      rating,
    } = req.body;

    const parsedPrice = parseFloat(pricePerNight);
    const parsedGuests = parseInt(guests);
    const parsedRating = parseFloat(rating);
    const parsedAmenities =
      typeof amenities === "string"
        ? amenities.split(",").map((a: string) => a.trim())
        : amenities;

    if (parsedGuests <= 0)
      return res.status(400).json({ message: "Guests must be greater than 0" });
    if (parsedPrice <= 0)
      return res
        .status(400)
        .json({ message: "Price per night must be greater than 0" });

    let photoUrls: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const results = await uploadListingPhotosHelper(req.files);
      photoUrls = results.map((result: any) => result.secure_url);
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        location,
        pricePerNight: parsedPrice,
        guests: parsedGuests,
        type,
        amenities: parsedAmenities,
        rating: parsedRating,
        photos: photoUrls,
        hostId: user,
      },
    });

    deleteCacheByPrefix("listings:");
    res.status(201).json(listing);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateListing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const {
    title,
    description,
    location,
    pricePerNight,
    guests,
    type,
    amenities,
    rating,
  } = req.body;

  try {
    if (guests <= 0) {
      return res.status(400).json({ message: "Guests must be greater than 0" });
    }
    if (pricePerNight <= 0) {
      return res
        .status(400)
        .json({ message: "Price per night must be greater than 0" });
    }

    const isOwned = await prisma.listing.findFirst({
      where: { id: id as string, hostId: user },
    });
    if (!isOwned) {
      return res
        .status(403)
        .json({ message: "This property is not owned by you" });
    }

    const listing = await prisma.listing.update({
      where: { id: id as string },
      data: {
        title,
        description,
        location,
        pricePerNight,
        guests,
        type,
        amenities,
        rating,
      },
    });

    deleteCacheByPrefix("listings:");
    res.status(200).json(listing);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteListing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const isOwned = await prisma.listing.findFirst({
      where: { id: id as string, hostId: user },
    });
    if (!isOwned) {
      return res
        .status(403)
        .json({ message: "This property is not owned by you" });
    }

    await prisma.listing.delete({ where: { id: id as string } });

    deleteCacheByPrefix("listings:");
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchListings = async (req: Request, res: Response) => {
  const { location, type, minPrice, maxPrice, guests } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (location)
    where.location = { contains: location as string, mode: "insensitive" };
  if (type) where.type = type as string;
  if (minPrice || maxPrice) {
    where.pricePerNight = {};
    if (minPrice) where.pricePerNight.gte = parseFloat(minPrice as string);
    if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice as string);
  }
  if (guests) where.guests = { gte: parseInt(guests as string) };

  try {
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        include: { host: { select: { name: true, email: true } } },
      }),
      prisma.listing.count({ where }),
    ]);

    res.status(200).json({
      data: listings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getListingStats = async (req: Request, res: Response) => {
  const cacheKey = "listings:stats";
  const cached = getCache(cacheKey);
  if (cached) return res.status(200).json(cached);

  try {
    const [totalListings, priceAggregate, byLocation, byType] =
      await Promise.all([
        prisma.listing.count(),
        prisma.listing.aggregate({ _avg: { pricePerNight: true } }),
        prisma.listing.groupBy({
          by: ["location"],
          _count: { location: true },
        }),
        prisma.listing.groupBy({ by: ["type"], _count: { type: true } }),
      ]);

    const response = {
      totalListings,
      averagePrice: priceAggregate._avg.pricePerNight,
      byLocation,
      byType,
    };

    setCache(cacheKey, response, 300);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
