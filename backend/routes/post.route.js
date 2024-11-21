import express from "express";
import { schedulePost } from "../controllers/post.controller.js"; // Import the function
import { authMiddleware } from "../middleware/auth.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	createPost,
	getFeedPosts,
	deletePost,
	getPostById,
	createComment,
	likePost,
	// addNestedComment, 
	// deleteComment
} from "../controllers/post.controller.js";
const router = express.Router();

router.get("/", protectRoute, getFeedPosts);
router.post("/create", protectRoute, createPost);
router.delete("/delete/:id", protectRoute, deletePost);
router.get("/:id", protectRoute, getPostById);
router.post("/:id/comment", protectRoute, createComment);
router.post("/:id/like", protectRoute, likePost);
router.put("/:id/schedule", authMiddleware, schedulePost);

export default router;
