"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListingStats = exports.searchListings = exports.deleteListing = exports.updateListing = exports.createListing = exports.getListingById = exports.getMyListings = exports.getAllListings = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const helpers_1 = require("../lib/helpers");
const cache_1 = require("../lib/cache");
const parseStringArray = (value) => {
    if (Array.isArray(value))
        return value.map(String).filter(Boolean);
    if (typeof value !== "string" || !value.trim())
        return [];
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed))
            return parsed.map(String).filter(Boolean);
    }
    catch {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return [];
};
const getAllListings = async (req, res) => {
    try {
        const listings = await prisma_1.default.listing.findMany({
            where: { host: { hostStatus: "approved" } },
            include: { host: { select: { name: true, email: true } } },
        });
        res.status(200).json(listings);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllListings = getAllListings;
const getMyListings = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const user = req.user;
    const role = req.role;
    const cacheKey = `listings:all:page:${page}:limit:${limit}:user:${user}:role:${role}`;
    const cached = (0, cache_1.getCache)(cacheKey);
    if (cached)
        return res.status(200).json(cached);
    try {
        const where = role === "host" ? { hostId: user } : {};
        const [listings, total] = await Promise.all([
            prisma_1.default.listing.findMany({
                where,
                skip,
                take: limit,
                include: { host: { select: { name: true, email: true } } },
            }),
            prisma_1.default.listing.count({ where }),
        ]);
        const response = {
            data: listings,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
        (0, cache_1.setCache)(cacheKey, response, 60);
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getMyListings = getMyListings;
const getListingById = async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await prisma_1.default.listing.findFirst({
            where: { id: id, host: { hostStatus: "approved" } },
            include: { host: { select: { name: true, email: true, avatar: true } } },
        });
        if (listing) {
            res.status(200).json({ listing });
        }
        else {
            res.status(404).json({ message: "Listing not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getListingById = getListingById;
const createListing = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const { title, description, location, pricePerNight, guests, type, amenities, rating, } = req.body;
        const parsedPrice = parseFloat(pricePerNight);
        const parsedGuests = parseInt(guests);
        const parsedRating = parseFloat(rating);
        const parsedAmenities = typeof amenities === "string"
            ? amenities.split(",").map((a) => a.trim())
            : amenities;
        if (parsedGuests <= 0)
            return res.status(400).json({ message: "Guests must be greater than 0" });
        if (parsedPrice <= 0)
            return res
                .status(400)
                .json({ message: "Price per night must be greater than 0" });
        let photoUrls = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const results = await (0, helpers_1.uploadListingPhotos)(req.files);
            photoUrls = results.map((result) => result.secure_url);
        }
        const listing = await prisma_1.default.listing.create({
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
        (0, cache_1.deleteCacheByPrefix)("listings:");
        res.status(201).json(listing);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createListing = createListing;
const updateListing = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const { title, description, location, pricePerNight, guests, type, amenities, existingPhotos, } = req.body;
    try {
        const parsedPrice = parseFloat(pricePerNight);
        const parsedGuests = parseInt(guests);
        const parsedAmenities = parseStringArray(amenities);
        const parsedExistingPhotos = parseStringArray(existingPhotos);
        if (!Number.isFinite(parsedGuests) || parsedGuests <= 0) {
            return res.status(400).json({ message: "Guests must be greater than 0" });
        }
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            return res
                .status(400)
                .json({ message: "Price per night must be greater than 0" });
        }
        const listingToUpdate = await prisma_1.default.listing.findFirst({
            where: { id: id, hostId: user },
        });
        if (!listingToUpdate) {
            return res
                .status(403)
                .json({ message: "This property is not owned by you or not found" });
        }
        let newPhotoUrls = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            try {
                const results = await (0, helpers_1.uploadListingPhotos)(req.files);
                newPhotoUrls = results.map((result) => result.secure_url);
            }
            catch (error) {
                console.log("Listing photo upload failed:", error);
                return res.status(502).json({
                    message: "Could not upload listing photos. Please check Cloudinary/network configuration and try again.",
                });
            }
        }
        const allPhotos = [...parsedExistingPhotos, ...newPhotoUrls];
        const listing = await prisma_1.default.listing.update({
            where: { id: id },
            data: {
                title,
                description,
                location,
                pricePerNight: parsedPrice,
                guests: parsedGuests,
                type,
                amenities: parsedAmenities,
                photos: allPhotos,
            },
        });
        (0, cache_1.deleteCacheByPrefix)("listings:");
        res.status(200).json(listing);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateListing = updateListing;
const deleteListing = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const isOwned = await prisma_1.default.listing.findFirst({
            where: { id: id, hostId: user },
        });
        if (!isOwned) {
            return res
                .status(403)
                .json({ message: "This property is not owned by you" });
        }
        await prisma_1.default.listing.delete({ where: { id: id } });
        (0, cache_1.deleteCacheByPrefix)("listings:");
        res.status(200).json({ message: "Listing deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteListing = deleteListing;
const searchListings = async (req, res) => {
    const { location, type, minPrice, maxPrice, guests } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = { host: { hostStatus: "approved" } };
    if (location)
        where.location = { contains: location, mode: "insensitive" };
    if (type) {
        const types = Array.isArray(type)
            ? type.flatMap((item) => String(item).split(","))
            : String(type).split(",");
        const normalizedTypes = types
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean);
        if (normalizedTypes.length === 1) {
            where.type = normalizedTypes[0];
        }
        else if (normalizedTypes.length > 1) {
            where.type = { in: normalizedTypes };
        }
    }
    if (minPrice || maxPrice) {
        where.pricePerNight = {};
        if (minPrice)
            where.pricePerNight.gte = parseFloat(minPrice);
        if (maxPrice)
            where.pricePerNight.lte = parseFloat(maxPrice);
    }
    if (guests)
        where.guests = { gte: parseInt(guests) };
    try {
        const [listings, total] = await Promise.all([
            prisma_1.default.listing.findMany({
                where,
                skip,
                take: limit,
                include: { host: { select: { name: true, email: true } } },
            }),
            prisma_1.default.listing.count({ where }),
        ]);
        res.status(200).json({
            data: listings,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.searchListings = searchListings;
const getListingStats = async (req, res) => {
    const cacheKey = "listings:stats";
    const cached = (0, cache_1.getCache)(cacheKey);
    if (cached)
        return res.status(200).json(cached);
    try {
        const [totalListings, priceAggregate, byLocation, byType] = await Promise.all([
            prisma_1.default.listing.count({ where: { host: { hostStatus: "approved" } } }),
            prisma_1.default.listing.aggregate({
                where: { host: { hostStatus: "approved" } },
                _avg: { pricePerNight: true },
            }),
            prisma_1.default.listing.groupBy({
                where: { host: { hostStatus: "approved" } },
                by: ["location"],
                _count: { location: true },
            }),
            prisma_1.default.listing.groupBy({
                where: { host: { hostStatus: "approved" } },
                by: ["type"],
                _count: { type: true },
            }),
        ]);
        const response = {
            totalListings,
            averagePrice: priceAggregate._avg.pricePerNight,
            byLocation,
            byType,
        };
        (0, cache_1.setCache)(cacheKey, response, 300);
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getListingStats = getListingStats;
