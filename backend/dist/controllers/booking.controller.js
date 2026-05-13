"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.updateBooking = exports.createBooking = exports.getBookingById = exports.getAllBookings = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../lib/prisma"));
const resend_1 = require("../middleware/resend");
const mail_temp_1 = require("../templates/mail.temp");
const getAllBookings = async (req, res) => {
    const user = req.user;
    const role = req.role;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const now = new Date();
    try {
        const baseWhere = role === "guest" ? { guestId: user } : { listing: { hostId: user } };
        const where = status === "upcoming"
            ? {
                ...baseWhere,
                status: { in: [client_1.BookingStatus.pending, client_1.BookingStatus.confirmed] },
                checkOut: { gte: now },
            }
            : status === "past"
                ? {
                    ...baseWhere,
                    status: { not: client_1.BookingStatus.cancelled },
                    checkOut: { lt: now },
                }
                : status === "cancelled"
                    ? { ...baseWhere, status: client_1.BookingStatus.cancelled }
                    : baseWhere;
        const [bookings, total] = await Promise.all([
            prisma_1.default.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    guest: { select: { name: true, email: true, avatar: true } },
                    listing: {
                        select: {
                            id: true,
                            title: true,
                            location: true,
                            photos: true,
                            pricePerNight: true,
                        },
                    },
                },
            }),
            prisma_1.default.booking.count({ where }),
        ]);
        res.status(200).json({
            data: bookings,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllBookings = getAllBookings;
const getBookingById = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const role = req.role;
    try {
        const booking = await prisma_1.default.booking.findUnique({
            where: { id: id },
            include: {
                guest: true,
                listing: true,
            },
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (role === "guest" && booking.guestId !== user) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        if (role === "host" && booking.listing.hostId !== user) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getBookingById = getBookingById;
const createBooking = async (req, res) => {
    const user = req.user;
    const { listingId, checkIn, checkOut } = req.body;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (Number.isNaN(checkInDate.getTime()) ||
        Number.isNaN(checkOutDate.getTime())) {
        return res
            .status(400)
            .json({ message: "Valid check-in and check-out dates are required" });
    }
    if (checkOutDate <= checkInDate) {
        return res
            .status(400)
            .json({ message: "Check-out must be after check-in" });
    }
    try {
        const listing = await prisma_1.default.listing.findFirst({
            where: { id: listingId, host: { hostStatus: "approved" } },
        });
        if (!listing)
            return res.status(404).json({ message: "Listing not found" });
        const overlappingBooking = await prisma_1.default.booking.findFirst({
            where: {
                listingId,
                status: { not: client_1.BookingStatus.cancelled },
                checkIn: { lt: checkOutDate },
                checkOut: { gt: checkInDate },
            },
            select: { id: true },
        });
        if (overlappingBooking) {
            return res.status(409).json({
                message: "These dates are unavailable because the listing is already booked",
            });
        }
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * listing.pricePerNight;
        const booking = await prisma_1.default.booking.create({
            data: {
                checkIn: checkInDate,
                checkOut: checkOutDate,
                totalPrice,
                guestId: user,
                listingId,
            },
        });
        const guest = await prisma_1.default.user.findUnique({ where: { id: user } });
        await (0, resend_1.sendEmail)({
            to: guest?.email,
            subject: `Booking Confirmation - ${listing.title}`,
            html: (0, mail_temp_1.bookingConfirmationEmail)(listing.title, checkIn, checkOut),
        });
        res.status(201).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createBooking = createBooking;
const updateBooking = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const role = req.role;
    const { status } = req.body;
    try {
        const booking = await prisma_1.default.booking.findUnique({
            where: { id: id },
            include: { listing: true, guest: true },
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (role === "host") {
            const host = await prisma_1.default.user.findUnique({
                where: { id: user },
                select: { hostStatus: true },
            });
            if (!host || host.hostStatus !== "approved") {
                return res.status(403).json({
                    message: "Your host account must be approved before performing this action",
                });
            }
        }
        if (role === "host" && booking.listing.hostId !== user) {
            return res
                .status(403)
                .json({ message: "Only the host can update booking status" });
        }
        if (role !== "host") {
            return res
                .status(403)
                .json({ message: "Only hosts can update booking status" });
        }
        const updated = await prisma_1.default.booking.update({
            where: { id: id },
            data: { status },
        });
        await (0, resend_1.sendEmail)({
            to: booking.guest?.email,
            subject: `Booking Status Update: ${status}`,
            html: (0, mail_temp_1.bookingStatusEmail)(status, booking.listing.title),
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateBooking = updateBooking;
const deleteBooking = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const booking = await prisma_1.default.booking.findUnique({
            where: { id: id },
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.guestId !== user) {
            return res
                .status(403)
                .json({ message: "You can only cancel your own bookings" });
        }
        await prisma_1.default.booking.delete({ where: { id: id } });
        res.status(200).json({ message: "Booking cancelled successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteBooking = deleteBooking;
