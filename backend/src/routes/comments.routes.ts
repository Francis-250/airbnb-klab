import { Router } from "express";
import {
  createComment,
  deleteComment,
  getListingComments,
} from "../controllers/comments.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/listing/:id", getListingComments);
router.post("/", verifyToken, createComment);
router.delete("/:id", verifyToken, deleteComment);

export default router;
