import express, { Request, Response } from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import listingsRoutes from "./routes/listings.routes";
import usersRoutes from "./routes/users.routes";
import authRoutes from "./routes/auth.routes";
import bookingRoutes from "./routes/booking.routes";
import statsRoutes from "./routes/stats.routes";
import aiRoute from "./routes/ai.routes";
import { setupSwagger } from "./lib/swagger";
import { generalLimiter } from "./middleware/ratelimiter";

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = [
  "http://localhost:4000",
  "https://airbnb-api-oi1o.onrender.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(compression());

app.use(express.json());
app.use(cookieParser());
app.use(generalLimiter);

setupSwagger(app);

app.use("/api/listings", listingsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/ai", aiRoute);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the Airbnb API" });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Api is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
