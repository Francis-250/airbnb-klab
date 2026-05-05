"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200: { description: Success }
 *       401: { description: Unauthorized }
 */
router.get("/", auth_middleware_1.verifyToken, booking_controller_1.getAllBookings);
/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Success }
 *       401: { description: Unauthorized }
 *       404: { description: Booking not found }
 */
router.get("/:id", auth_middleware_1.verifyToken, booking_controller_1.getBookingById);
/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listingId
 *               - checkIn
 *               - checkOut
 *             properties:
 *               listingId: { type: string }
 *               checkIn: { type: string, format: date }
 *               checkOut: { type: string, format: date }
 *     responses:
 *       201: { description: Booking created }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 */
router.post("/", auth_middleware_1.verifyToken, auth_middleware_1.isGuest, booking_controller_1.createBooking);
/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status: { type: string, enum: [pending, confirmed, cancelled] }
 *     responses:
 *       200: { description: Booking updated }
 *       401: { description: Unauthorized }
 *       404: { description: Booking not found }
 */
router.patch("/:id/status", auth_middleware_1.verifyToken, booking_controller_1.updateBooking);
/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Booking deleted }
 *       401: { description: Unauthorized }
 *       404: { description: Booking not found }
 */
router.delete("/:id", auth_middleware_1.verifyToken, auth_middleware_1.isGuest, booking_controller_1.deleteBooking);
exports.default = router;
