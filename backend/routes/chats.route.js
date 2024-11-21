import express from "express";
import { getMessages, sendMessage } from "../controllers/chats.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/send/:userId/:otherUserId", getMessages);
router.post("/send/:id", sendMessage);

export default router;