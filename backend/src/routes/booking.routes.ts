import { Router } from "express";
import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
} from "../controllers/booking.controller";
import { isGuest, verifyToken } from "../middleware/auth.middleware";

const router = Router();

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
router.get("/", verifyToken, getAllBookings);

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
router.get("/:id", verifyToken, getBookingById);

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
router.post("/", verifyToken, isGuest, createBooking);

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
router.patch("/:id/status", verifyToken, updateBooking);

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
router.delete("/:id", verifyToken, isGuest, deleteBooking);

export default router;
