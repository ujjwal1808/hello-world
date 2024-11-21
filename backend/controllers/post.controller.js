import cloudinary from "../lib/cloudinary.js";
import Post from '../models/post.model.js';
import Notification from "../models/notification.model.js";
// import { sendCommentNotificationEmail } from "../emails/emailHandlers.js";

// export const createPost = async (req, res) => {
// 	try {
// 	  const { content, scheduledPostDate } = req.body;
// 	  // Validate scheduledPostDate (if provided)
// 	  let postStatus = "published"; // Default status
// 	  let postScheduledDate = null; // Default scheduled date
// 	  if (scheduledPostDate) {
// 		const date = new Date(scheduledPostDate);
// 		if (date > new Date()) {
// 		  postStatus = "scheduled";
// 		  postScheduledDate = date;
// 		}
// 	  }
// 	  const newPost = await Post.create({
// 		author: req.user._id,
// 		content,
// 		scheduledPostDate: postScheduledDate,
// 		status: postStatus,
// 	  });
  
// 	  res.status(201).json(newPost);
// 	} catch (error) {
// 	  console.error("Error creating post:", error);
// 	  res.status(500).json({ message: "Failed to create post" });
// 	}
//   };
  
// export const createPost = async (req, res) => {
// 	try {
// 	  const { content, image, scheduledPostDate } = req.body;
// 	  let newPost;
  
// 	  // Parse and validate the scheduledPostDate (if provided)
// 	  let scheduledDate = null;
// 	  if (scheduledPostDate) {
// 		const parsedDate = new Date(scheduledPostDate);
// 		if (isNaN(parsedDate.getTime())) {
// 		  return res.status(400).json({ message: "Invalid scheduled date value" });
// 		}
// 		scheduledDate = parsedDate;
// 	  }
  
// 	  // Create the post object with or without the image
// 	  if (image) {
// 		const imgResult = await cloudinary.uploader.upload(image);
// 		newPost = new Post({
// 		  author: req.user._id,
// 		  content,
// 		  image: imgResult.secure_url,
// 		  scheduledPostDate: scheduledDate || null, // Null for normal posts
// 		  status: scheduledDate ? "scheduled" : "published", // Status based on whether it's scheduled
// 		});
// 	  } else {
// 		newPost = new Post({
// 		  author: req.user._id,
// 		  content,
// 		  scheduledPostDate: scheduledDate || null,
// 		  status: scheduledDate ? "scheduled" : "published",
// 		});
// 	  }
  
// 	  // Save the post
// 	  await newPost.save();
  
// 	  res.status(201).json(newPost);
// 	} catch (error) {
// 	  console.error("Error in createPost controller:", error);
// 	  res.status(500).json({ message: "Server error" });
// 	}
//   };
  
  // Create Post Controller
export const createPost = async (req, res) => {
	try {
	  const { content, image, scheduledPostDate } = req.body;
  
	  // Determine the post's status based on scheduledPostDate
	  const status = scheduledPostDate ? "scheduled" : "published";
  
	  // Create a new post object
	  const newPost = new Post({
		author: req.user._id, // Assume user authentication middleware is in place
		content,
		image: image || null, // Use null if no image provided
		scheduledPostDate: scheduledPostDate || null,
		status,
	  });
  
	  // Save post to the database
	  await newPost.save();
  
	  res.status(201).json({ message: "Post created successfully!", post: newPost });
	} catch (error) {
	  console.error("Error in createPost controller:", error);
	  res.status(500).json({ message: "Server error while creating the post." });
	}
  };
// export const createPost = async (req, res) => {
// 	try {
// 	  const { content, userId, scheduledPostDate } = req.body;
  
// 	  // Ensure required fields are present
// 	  if (!content || !userId) {
// 		return res.status(400).json({ message: "Content and userId are required." });
// 	  }
  
// 	  const newPost = new Post({
// 		content,
// 		userId,
// 		createdAt: new Date(),
// 		scheduledPostDate: scheduledPostDate ? new Date(scheduledPostDate) : null,
// 	  });
  
// 	  await newPost.save();
  
// 	  res.status(201).json(newPost);
// 	} catch (err) {
// 	  console.error(err);
// 	  res.status(500).json({ message: "Error creating post." });
// 	}
//   };
  
export const getFeedPosts = async (req, res) => {
	try {
		const now = new Date();
		// Fetch published posts and scheduled posts that are ready to be displayed
		const posts = await Post.find({
		  $or: [
			{ status: "published" },
			{ status: "scheduled", scheduledPostDate: { $lte: now } },
		  ],
		})
		  .sort({ createdAt: -1 })
		  .populate("author", "name profilePicture");
	
		res.status(200).json(posts);
	  } catch (error) {
		console.error("Error fetching posts:", error);
		res.status(500).json({ message: "Failed to fetch posts" });
	  }
	  
};

export const deletePost = async (req, res) => {
	try {
		const postId = req.params.id;
		const userId = req.user._id;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}

		// check if the current user is the author of the post
		if (post.author.toString() !== userId.toString()) {
			return res.status(403).json({ message: "You are not authorized to delete this post" });
		}

		// delete the image from cloudinary as well!
		if (post.image) {
			await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0]);
		}

		await Post.findByIdAndDelete(postId);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in delete post controller", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

export const getPostById = async (req, res) => {
	try {
		const postId = req.params.id;
		const post = await Post.findById(postId)
			.populate("author", "name username profilePicture headline")
			.populate("comments.user", "name profilePicture username headline");

		res.status(200).json(post);
	} catch (error) {
		console.error("Error in getPostById controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
export const createComment = async (req, res) => {
	try {
	  const postId = req.params.id;
	  const { content } = req.body;
  
	  if (!content || content.trim() === "") {
		return res.status(400).json({ message: "Comment content is required" });
	  }
  
	  const post = await Post.findById(postId);
  
	  if (!post) {
		return res.status(404).json({ message: "Post not found" });
	  }
  
	  // Add the comment to the post
	  const newComment = {
		user: req.user._id,
		content,
		createdAt: new Date(),
	  };
  
	  post.comments.push(newComment);
	  await post.save();
  
	  // Populate the author and return the updated post
	  const updatedPost = await Post.findById(postId)
		.populate("author", "name  username headline profilePicture")
		.populate("comments.user", "name profilePicture");
  
	  // Send notification if the commenter is not the post owner
	  if (post.author._id.toString() !== req.user._id.toString()) {
		const newNotification = new Notification({
		  recipient: post.author._id,
		  type: "comment",
		  relatedUser: req.user._id,
		  relatedPost: postId,
		});
  
		await newNotification.save();
  
		try {
		  const postUrl = `${process.env.CLIENT_URL}/post/${postId}`;
		  await sendCommentNotificationEmail(
			// post.author.email,
			post.author.name,
			req.user.name,
			postUrl,
			content
		  );
		} catch (emailError) {
		  console.error("Error sending comment notification email:", emailError);
		}
	  }
  
	  res.status(200).json(updatedPost);
	} catch (error) {
	  console.error("Error in createComment controller:", error);
	  res.status(500).json({ message: "Server error" });
	}
  };
  
// export const createComment = async (req, res) => {
// 	try {
// 		const postId = req.params.id;
// 		const { content } = req.body;

// 		const post = await Post.findByIdAndUpdate(
// 			postId,
// 			{
// 				$push: { comments: { user: req.user._id, content } },
// 			},
// 			{ new: true }
// 		).populate("author", "name email username headline profilePicture");

// 		// create a notification if the comment owner is not the post owner
// 		if (post.author._id.toString() !== req.user._id.toString()) {
// 			const newNotification = new Notification({
// 				recipient: post.author,
// 				type: "comment",
// 				relatedUser: req.user._id,
// 				relatedPost: postId,
// 			});

// 			await newNotification.save();

// 			try {
// 				const postUrl = process.env.CLIENT_URL + "/post/" + postId;
// 				await sendCommentNotificationEmail(
// 					post.author.email,
// 					post.author.name,
// 					req.user.name,
// 					postUrl,
// 					content
// 				);
// 			} catch (error) {
// 				console.log("Error in sending comment notification email:", error);
// 			}
// 		}

// 		res.status(200).json(post);
// 	} catch (error) {
// 		console.error("Error in createComment controller:", error);
// 		res.status(500).json({ message: "Server error" });
// 	}
// };

export const likePost = async (req, res) => {
	try {
		const postId = req.params.id;
		const post = await Post.findById(postId);
		const userId = req.user._id;

		if (post.likes.includes(userId)) {
			// unlike the post
			post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
		} else {
			// like the post
			post.likes.push(userId);
			// create a notification if the post owner is not the user who liked
			if (post.author.toString() !== userId.toString()) {
				const newNotification = new Notification({
					recipient: post.author,
					type: "like",
					relatedUser: userId,
					relatedPost: postId,
				});

				await newNotification.save();
			}
		}

		await post.save();

		res.status(200).json(post);
	} catch (error) {
		console.error("Error in likePost controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
// import Post from "../models/post.model.js";
export const schedulePost = async (req, res) => {
	try {
	  const { id } = req.params; // Post ID
	  const { scheduledPostDate } = req.body; // Date from frontend
  
	  const post = await Post.findById(id);
  
	  if (!post) {
		return res.status(404).json({ message: "Post not found" });
	  }
  
	  // Update the post with the scheduled date
	  post.scheduledPostDate = scheduledPostDate ? new Date(scheduledPostDate) : null;
	  post.status = scheduledPostDate ? "scheduled" : "published";
  
	  await post.save();
  
	  res.status(200).json(post);
	} catch (error) {
	  console.error("Error scheduling post:", error);
	  res.status(500).json({ message: "Server error" });
	}
  };
  
//   export const addNestedComment = async (req, res) => {
// 	try {
// 	  const { postId, commentId } = req.params; // Parent comment ID
// 	  const { content } = req.body;
  
// 	  const post = await Post.findById(postId);
// 	  if (!post) return res.status(404).json({ message: "Post not found" });
  
// 	  const parentComment = post.comments.id(commentId);
// 	  if (!parentComment) return res.status(404).json({ message: "Comment not found" });
  
// 	  // Add the nested reply
// 	  const newReply = {
// 		user: req.user._id,
// 		content,
// 		createdAt: new Date(),
// 	  };
// 	  parentComment.replies.push(newReply);
// 	  await post.save();
  
// 	  const updatedPost = await Post.findById(postId)
// 		.populate("comments.user", "name profilePicture")
// 		.populate("comments.replies.user", "name profilePicture");
  
// 	  res.status(201).json(updatedPost);
// 	} catch (error) {
// 	  console.error("Error in addNestedComment:", error);
// 	  res.status(500).json({ message: "Server error" });
// 	}
//   };
//   export const deleteComment = async (req, res) => {
// 	try {
// 	  const { postId, commentId } = req.params;
  
// 	  const post = await Post.findById(postId);
// 	  if (!post) return res.status(404).json({ message: "Post not found" });
  
// 	  const comment = post.comments.id(commentId);
// 	  if (!comment) return res.status(404).json({ message: "Comment not found" });
  
// 	  // Check if the comment belongs to the user or if the user is the post owner
// 	  if (
// 		comment.user.toString() !== req.user._id.toString() &&
// 		post.author.toString() !== req.user._id.toString()
// 	  ) {
// 		return res.status(403).json({ message: "Unauthorized to delete this comment" });
// 	  }
  
// 	  comment.remove();
// 	  await post.save();
  
// 	  res.status(200).json({ message: "Comment deleted successfully" });
// 	} catch (error) {
// 	  console.error("Error in deleteComment:", error);
// 	  res.status(500).json({ message: "Server error" });
// 	}
//   };
  