"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.updateBooking = exports.createBooking = exports.getBookingById = exports.getAllBookings = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const mailer_1 = require("../middleware/mailer");
const mail_temp_1 = require("../templates/mail.temp");
const getAllBookings = async (req, res) => {
    const user = req.user;
    const role = req.role;
    try {
        const bookings = await prisma_1.default.booking.findMany({
            where: role === "guest" ? { guestId: user } : { listing: { hostId: user } },
            include: {
                guest: { select: { name: true, avatar: true } },
                listing: { select: { title: true, location: true } },
            },
        });
        res.status(200).json(bookings);
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
    try {
        const listing = await prisma_1.default.listing.findUnique({
            where: { id: listingId },
        });
        if (!listing)
            return res.status(404).json({ message: "Listing not found" });
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
        await (0, mailer_1.sendEmail)({
            to: guest?.email,
            subject: "Welcome to Airbnb!",
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
            include: { listing: true },
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (role === "host" && booking.listing.hostId !== user) {
            return res
                .status(403)
                .json({ message: "Only the host can update booking status" });
        }
        if (role === "guest") {
            return res
                .status(403)
                .json({ message: "Guests are not allowed to update booking status" });
        }
        const updated = await prisma_1.default.booking.update({
            where: { id: id },
            data: { status },
        });
        const message = status === "approved"
            ? "Your booking has been approved!"
            : "Your booking has been rejected.";
        const guest = await prisma_1.default.user.findUnique({ where: { id: user } });
        await (0, mailer_1.sendEmail)({
            to: guest?.email,
            subject: "Welcome to Airbnb!",
            html: (0, mail_temp_1.bookingStatusEmail)(status),
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
