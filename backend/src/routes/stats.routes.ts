import { Router } from "express";
import {
  getUserStats,
  getDashboardStats,
} from "../controllers/stats.controller";
import { verifyToken, isHost } from "../middleware/auth.middleware";

const router = Router();

router.get("/users", getUserStats);
router.get("/dashboard", verifyToken, isHost, getDashboardStats);

export default router;
