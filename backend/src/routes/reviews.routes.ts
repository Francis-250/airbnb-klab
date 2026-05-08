import { Router } from "express";
import {
  createReview,
  getListingReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller";
import { verifyToken, isGuest } from "../middleware/auth.middleware";

const router = Router();

router.post("/", verifyToken, isGuest, createReview);

router.get("/listing/:id", getListingReviews);

router.put("/:id", verifyToken, updateReview);

router.delete("/:id", verifyToken, deleteReview);

export default router;
