"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const listings_routes_1 = __importDefault(require("./routes/listings.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const swagger_1 = require("./lib/swagger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)({
    origin: "http://localhost:4000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
(0, swagger_1.setupSwagger)(app);
app.use("/api/listings", listings_routes_1.default);
app.use("/api/users", users_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/bookings", booking_routes_1.default);
app.get("/", (req, res) => {
    res.status(200).json({ message: "Api is running" });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
