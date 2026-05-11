import { Router } from "express";
import {
  createOrGetConversation,
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/conversations.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/", verifyToken, createOrGetConversation);
router.get("/", verifyToken, getConversations);
router.get("/:id/messages", verifyToken, getMessages);
router.post("/:id/messages", verifyToken, sendMessage);

export default router;
