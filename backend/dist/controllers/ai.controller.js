"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewSummary = exports.recommend = exports.chatbot = exports.generateDescription = exports.smartSearch = void 0;
const messages_1 = require("@langchain/core/messages");
const ai_1 = require("../lib/ai");
const prisma_1 = __importDefault(require("../lib/prisma"));
const cache_1 = require("../lib/cache");
function safeParseJSON(text) {
    try {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match)
            return null;
        return JSON.parse(match[0]);
    }
    catch {
        return null;
    }
}
function handleAIError(error, res) {
    if (error?.status === 429) {
        return res
            .status(429)
            .json({ message: "AI service is busy, please try again in a moment" });
    }
    if (error?.status === 401) {
        return res.status(500).json({ message: "AI service configuration error" });
    }
    return res.status(500).json({ message: "Internal server error" });
}
const smartSearch = async (req, res) => {
    const { query } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (!query) {
        return res.status(400).json({ message: "query is required" });
    }
    try {
        const analysisPrompt = `Analyze this property search query: "${query}"

Return ONLY valid JSON, no markdown, no explanation:
{"isPropertySearch":true,"confidence":"high","feedback":"string","suggestion":null,"filters":{"location":null,"type":null,"minPrice":null,"maxPrice":null,"guests":null}}

Rules:
- isPropertySearch: false if unrelated to finding a property to rent
- confidence: "high" (3+ filters found) | "medium" (2 filters) | "low" (1 filter)
- feedback: one sentence summarizing what you understood e.g. "Looking for a house in Kigali under $200"
- suggestion: improvement tip if confidence is low, else null
- type: one of apartment|house|villa|cabin or null
- minPrice/maxPrice: number or null
- guests: number or null`;
        const aiResponse = await ai_1.deterministicModel.invoke([
            new messages_1.HumanMessage(analysisPrompt),
        ]);
        console.log("Raw AI:", aiResponse.content);
        const analysis = safeParseJSON(aiResponse.content);
        console.log("Parsed:", analysis);
        if (!analysis) {
            return res.status(500).json({ message: "AI returned invalid response" });
        }
        if (!analysis.isPropertySearch) {
            return res.status(400).json({
                message: "That doesn't look like a property search. Try something like 'house in Kigali under $200'",
                feedback: analysis.feedback,
            });
        }
        const filters = analysis.filters;
        if (!filters || Object.values(filters).every((v) => v === null)) {
            return res.status(400).json({
                message: "Could not extract any filters from your query, please be more specific",
                feedback: analysis.feedback,
                suggestion: analysis.suggestion,
            });
        }
        const where = {};
        if (filters.location) {
            where.location = { contains: filters.location, mode: "insensitive" };
        }
        if (filters.type) {
            where.type = filters.type.toLowerCase();
        }
        if (filters.minPrice || filters.maxPrice) {
            where.pricePerNight = {};
            if (filters.minPrice)
                where.pricePerNight.gte = Number(filters.minPrice);
            if (filters.maxPrice)
                where.pricePerNight.lte = Number(filters.maxPrice);
        }
        if (filters.guests) {
            where.guests = { gte: Number(filters.guests) };
        }
        const [listings, total] = await Promise.all([
            prisma_1.default.listing.findMany({
                where,
                skip,
                take: limit,
                include: { host: { select: { name: true, email: true } } },
            }),
            prisma_1.default.listing.count({ where }),
        ]);
        return res.json({
            feedback: analysis.feedback,
            confidence: analysis.confidence,
            suggestion: analysis.suggestion ?? null,
            filters,
            data: listings,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("smartSearch error:", error);
        handleAIError(error, res);
    }
};
exports.smartSearch = smartSearch;
const generateDescription = async (req, res) => {
    const { id } = req.params;
    const { tone = "professional" } = req.body;
    const user = req.user;
    const toneStyles = {
        professional: "formal, clear and business-like",
        casual: "friendly, relaxed and conversational",
        luxury: "elegant, premium and aspirational",
    };
    if (!toneStyles[tone]) {
        return res
            .status(400)
            .json({ message: "tone must be professional, casual, or luxury" });
    }
    try {
        const listing = await prisma_1.default.listing.findUnique({
            where: { id: id },
        });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        if (listing.hostId !== user) {
            return res.status(403).json({ message: "You do not own this listing" });
        }
        const prompt = `You are a property listing copywriter.
Write a ${toneStyles[tone]} description for this property.

Property details:
- Title: ${listing.title}
- Location: ${listing.location}
- Type: ${listing.type}
- Price: $${listing.pricePerNight} per night
- Max guests: ${listing.guests}
- Amenities: ${listing.amenities.join(", ")}

Write exactly 3-4 sentences. Return only the description, nothing else.`;
        const aiResponse = await ai_1.model.invoke([new messages_1.HumanMessage(prompt)]);
        const description = aiResponse.content.trim();
        const updatedListing = await prisma_1.default.listing.update({
            where: { id: id },
            data: { description },
        });
        (0, cache_1.deleteCacheByPrefix)("listings:");
        res.status(200).json({ description, listing: updatedListing });
    }
    catch (error) {
        handleAIError(error, res);
    }
};
exports.generateDescription = generateDescription;
const sessions = new Map();
const chatbot = async (req, res) => {
    const { sessionId, message, listingId } = req.body;
    if (!sessionId || !message) {
        return res
            .status(400)
            .json({ message: "sessionId and message are required" });
    }
    try {
        let systemPrompt = "You are a helpful guest support assistant for an Airbnb-like platform. Help guests with their questions.";
        if (listingId) {
            const listing = await prisma_1.default.listing.findUnique({
                where: { id: listingId },
            });
            if (listing) {
                systemPrompt = `You are a helpful guest support assistant for an Airbnb-like platform.
You are currently helping a guest with questions about this specific listing:

Title: ${listing.title}
Location: ${listing.location}
Price per night: $${listing.pricePerNight}
Max guests: ${listing.guests}
Type: ${listing.type}
Amenities: ${listing.amenities.join(", ")}
Description: ${listing.description}

Answer questions about this listing accurately based on the details above.
If asked something not covered by the listing details, say you don't have that information.`;
            }
        }
        if (!sessions.has(sessionId)) {
            sessions.set(sessionId, []);
        }
        const history = sessions.get(sessionId);
        history.push(new messages_1.HumanMessage(message));
        if (history.length > 20) {
            history.splice(0, history.length - 20);
        }
        const aiResponse = await ai_1.model.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...history,
        ]);
        const reply = aiResponse.content;
        history.push(new messages_1.AIMessage(reply));
        res.status(200).json({
            response: reply,
            sessionId,
            messageCount: history.length,
        });
    }
    catch (error) {
        handleAIError(error, res);
    }
};
exports.chatbot = chatbot;
const recommend = async (req, res) => {
    const user = req.user;
    try {
        const bookings = await prisma_1.default.booking.findMany({
            where: { guestId: user },
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { listing: true },
        });
        if (bookings.length === 0) {
            return res.status(400).json({
                message: "No booking history found. Make some bookings first to get recommendations.",
            });
        }
        const historySummary = bookings
            .map((b, i) => `${i + 1}. ${b.listing.type} in ${b.listing.location} - $${b.listing.pricePerNight}/night for ${b.listing.guests} guests`)
            .join("\n");
        const prompt = `You are a travel recommendation engine.

Analyze this user's booking history and suggest filters to find new listings they would enjoy.

Booking history:
${historySummary}

Return ONLY this JSON, no explanation, no markdown:
{
  "preferences": "short description of what the user likes",
  "searchFilters": {
    "location": null,
    "type": null,
    "minPrice": null,
    "maxPrice": null,
    "guests": null
  },
  "reason": "short explanation of why these filters match the user"
}

Rules for searchFilters:
- type must be exactly one of: apartment, house, villa, cabin — or null
- minPrice and maxPrice are numbers or null
- guests is a number or null`;
        const aiResponse = await ai_1.deterministicModel.invoke([
            new messages_1.HumanMessage(prompt),
        ]);
        const result = safeParseJSON(aiResponse.content);
        if (!result) {
            return res.status(500).json({ message: "AI returned invalid response" });
        }
        const bookedIds = bookings.map((b) => b.listingId);
        const { searchFilters } = result;
        const where = { id: { notIn: bookedIds } };
        if (searchFilters.location) {
            where.location = {
                contains: searchFilters.location,
                mode: "insensitive",
            };
        }
        if (searchFilters.type) {
            where.type = searchFilters.type;
        }
        if (searchFilters.minPrice || searchFilters.maxPrice) {
            where.pricePerNight = {};
            if (searchFilters.minPrice)
                where.pricePerNight.gte = Number(searchFilters.minPrice);
            if (searchFilters.maxPrice)
                where.pricePerNight.lte = Number(searchFilters.maxPrice);
        }
        if (searchFilters.guests) {
            where.guests = { gte: Number(searchFilters.guests) };
        }
        const recommendations = await prisma_1.default.listing.findMany({
            where,
            take: 10,
            include: { host: { select: { name: true, email: true } } },
        });
        res.status(200).json({
            preferences: result.preferences,
            reason: result.reason,
            searchFilters,
            recommendations,
        });
    }
    catch (error) {
        handleAIError(error, res);
    }
};
exports.recommend = recommend;
const reviewSummary = async (req, res) => {
    const { id } = req.params;
    const cacheKey = `ai:review-summary:${id}`;
    const cached = (0, cache_1.getCache)(cacheKey);
    if (cached)
        return res.status(200).json(cached);
    try {
        const listing = await prisma_1.default.listing.findUnique({
            where: { id: id },
            include: {
                reviews: {
                    include: {
                        guest: { select: { name: true } },
                    },
                },
            },
        });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        if (listing.reviews.length < 3) {
            return res.status(400).json({
                message: "Not enough reviews to generate a summary (minimum 3 required)",
            });
        }
        const averageRating = Math.round((listing.reviews.reduce((sum, r) => sum + r.rating, 0) /
            listing.reviews.length) *
            10) / 10;
        const reviewsText = listing.reviews
            .map((r) => `- ${r.guest.name} (${r.rating}/5): ${r.comment}`)
            .join("\n");
        const prompt = `You are a review analyst for a property rental platform.

Analyze these guest reviews for the listing "${listing.title}":

${reviewsText}

Return ONLY this JSON, no explanation, no markdown:
{
  "summary": "2-3 sentence overall summary of the guest experience",
  "positives": ["thing guests praised", "another positive", "third positive"],
  "negatives": ["thing guests complained about"]
}

If there are no negatives, return an empty array for negatives.
Always return exactly 3 items in positives.`;
        const aiResponse = await ai_1.model.invoke([new messages_1.HumanMessage(prompt)]);
        const result = safeParseJSON(aiResponse.content);
        if (!result) {
            return res.status(500).json({ message: "AI returned invalid response" });
        }
        const response = {
            summary: result.summary,
            positives: result.positives,
            negatives: result.negatives,
            averageRating,
            totalReviews: listing.reviews.length,
        };
        (0, cache_1.setCache)(cacheKey, response, 600);
        res.status(200).json(response);
    }
    catch (error) {
        handleAIError(error, res);
    }
};
exports.reviewSummary = reviewSummary;
