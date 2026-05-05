"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const listings_controller_1 = require("../controllers/listings.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/listings:
 *   get:
 *     summary: Get all listings
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [apartment, house, villa, cabin] }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: guests
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Success }
 */
router.get("/", listings_controller_1.getAllListings);
/**
 * @swagger
 * /api/listings/{id}:
 *   get:
 *     summary: Get listing by ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Success }
 *       404: { description: Listing not found }
 */
router.get("/:id", listings_controller_1.getListingById);
/**
 * @swagger
 * /api/listings:
 *   post:
 *     summary: Create a listing (host only)
 *     tags: [Listings]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - location
 *               - pricePerNight
 *               - guests
 *               - type
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               location: { type: string }
 *               pricePerNight: { type: number }
 *               guests: { type: integer }
 *               type: { type: string, enum: [apartment, house, villa, cabin] }
 *               amenities: { type: array, items: { type: string } }
 *               photos: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       201: { description: Listing created }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden - hosts only }
 */
router.post("/", auth_middleware_1.verifyToken, auth_middleware_1.isHost, upload_middleware_1.upload.array("photos", 5), listings_controller_1.createListing);
/**
 * @swagger
 * /api/listings/{id}:
 *   put:
 *     summary: Update a listing (host only)
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               pricePerNight: { type: number }
 *               guests: { type: integer }
 *     responses:
 *       200: { description: Listing updated }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Listing not found }
 */
router.put("/:id", auth_middleware_1.verifyToken, auth_middleware_1.isHost, listings_controller_1.updateListing);
/**
 * @swagger
 * /api/listings/{id}:
 *   delete:
 *     summary: Delete a listing (host only)
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Listing deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Listing not found }
 */
router.delete("/:id", auth_middleware_1.verifyToken, auth_middleware_1.isHost, listings_controller_1.deleteListing);
exports.default = router;
