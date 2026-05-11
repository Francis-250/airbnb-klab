"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const listings_routes_1 = __importDefault(require("./routes/listings.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const reviews_routes_1 = __importDefault(require("./routes/reviews.routes"));
const conversations_routes_1 = __importDefault(require("./routes/conversations.routes"));
const swagger_1 = require("./lib/swagger");
const ratelimiter_1 = require("./middleware/ratelimiter");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const allowedOrigins = [
    "http://localhost:4000",
    "https://airbnb-api-oi1o.onrender.com",
    "http://localhost:5173",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log(`Blocked origin: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(ratelimiter_1.generalLimiter);
(0, swagger_1.setupSwagger)(app);
app.use("/api/listings", listings_routes_1.default);
app.use("/api/users", users_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/bookings", booking_routes_1.default);
app.use("/api/stats", stats_routes_1.default);
app.use("/api/ai", ai_routes_1.default);
app.use("/api/reviews", reviews_routes_1.default);
app.use("/api/conversations", conversations_routes_1.default);
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Airbnb API" });
});
app.get("/health", (req, res) => {
    res.status(200).json({ message: "Api is running" });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
