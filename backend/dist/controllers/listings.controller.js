"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteListing = exports.updateListing = exports.createListing = exports.getListingById = exports.getAllListings = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const helpers_1 = require("../lib/helpers");
const getAllListings = async (req, res) => {
    try {
        const listings = await prisma_1.default.listing.findMany();
        res.status(200).json(listings);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllListings = getAllListings;
const getListingById = async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await prisma_1.default.listing.findUnique({
            where: { id: id },
        });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        res.status(200).json(listing);
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
    const { title, description, location, pricePerNight, guests, type, amenities, rating, } = req.body;
    try {
        if (guests <= 0) {
            return res.status(400).json({ message: "Guests must be greater than 0" });
        }
        if (pricePerNight <= 0) {
            return res
                .status(400)
                .json({ message: "Price per night must be greater than 0" });
        }
        const isOwned = await prisma_1.default.listing.findFirst({
            where: { id: id, hostId: user },
        });
        if (!isOwned) {
            return res
                .status(403)
                .json({ message: "This property is not owned by you" });
        }
        const listing = await prisma_1.default.listing.update({
            where: { id: id },
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
        await prisma_1.default.listing.delete({
            where: { id: id },
        });
        res.status(200).json({ message: "Listing deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteListing = deleteListing;
