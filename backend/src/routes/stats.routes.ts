import { Router } from "express";
import {
  getUserStats,
  getDashboardStats,
} from "../controllers/stats.controller";
import { verifyToken, isApprovedHost } from "../middleware/auth.middleware";

const router = Router();

router.get("/users", getUserStats);
router.get("/dashboard", verifyToken, isApprovedHost, getDashboardStats);

export default router;
