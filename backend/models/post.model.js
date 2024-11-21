import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
	author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	content: { type: String, required: true },
	image: { type: String }, // URL for the image
	scheduledPostDate: { type: Date },
	status: { type: String, enum: ["published", "scheduled"], default: "published" },
	likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	createdAt: { type: Date, default: Date.now },
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  });
  

const Post = mongoose.model("Post", postSchema);

export default Post;
