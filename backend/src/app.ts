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
import reviewsRoutes from "./routes/reviews.routes";
import conversationsRoutes from "./routes/conversations.routes";
import commentsRoutes from "./routes/comments.routes";
import { setupSwagger } from "./lib/swagger";
import { generalLimiter } from "./middleware/ratelimiter";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const allowedOrigins = [
  "http://localhost:4000",
  "https://airbnb-api-oi1o.onrender.com",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://192.168.1.171:8081",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`Blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
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
app.use("/api/reviews", reviewsRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/comments", commentsRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the Airbnb API" });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Api is running" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
