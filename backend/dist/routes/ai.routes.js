"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/ai/search:
 *   post:
 *     summary: Smart listing search using AI
 *     tags: [AI]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query: { type: string }
 *     responses:
 *       200: { description: Search results with filters and pagination }
 *       400: { description: Query missing or too vague }
 *       500: { description: AI returned invalid response }
 */
router.post("/search", ai_controller_1.smartSearch);
/**
 * @swagger
 * /api/ai/listings/{id}/generate-description:
 *   post:
 *     summary: Generate AI description for a listing
 *     tags: [AI]
 *     security:
 *       - cookieAuth: []
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
 *               tone:
 *                 type: string
 *                 enum: [professional, casual, luxury]
 *     responses:
 *       200: { description: Description generated and saved }
 *       400: { description: Invalid tone }
 *       401: { description: Unauthorized }
 *       403: { description: You do not own this listing }
 *       404: { description: Listing not found }
 */
router.post("/listings/:id/generate-description", auth_middleware_1.verifyToken, ai_controller_1.generateDescription);
/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Guest support chatbot with optional listing context
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - message
 *             properties:
 *               sessionId: { type: string }
 *               message: { type: string }
 *               listingId: { type: string, nullable: true }
 *     responses:
 *       200: { description: AI response with session info }
 *       400: { description: sessionId or message missing }
 */
router.post("/chat", ai_controller_1.chatbot);
/**
 * @swagger
 * /api/ai/recommend:
 *   post:
 *     summary: AI recommendations based on booking history
 *     tags: [AI]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Recommended listings }
 *       400: { description: No booking history found }
 *       401: { description: Unauthorized }
 */
router.post("/recommend", auth_middleware_1.verifyToken, ai_controller_1.recommend);
/**
 * @swagger
 * /api/ai/listings/{id}/review-summary:
 *   get:
 *     summary: AI summary of listing reviews
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: AI review summary cached for 10 minutes }
 *       400: { description: Not enough reviews }
 *       404: { description: Listing not found }
 */
router.get("/listings/:id/review-summary", ai_controller_1.reviewSummary);
exports.default = router;
