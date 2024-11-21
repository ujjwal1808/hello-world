import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import chatRoutes from "./routes/chats.route.js"
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";
import { connectDB } from "./lib/db.js";
import { log } from "console";
import { Server } from "socket.io";
import chat from "./models/chats.model.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
if (process.env.NODE_ENV !== "production") {
	app.use(cors({origin: "http://localhost:5173",credentials: true,}));
}

app.use(express.json({ limit: "5mb" })); // parse JSON request bodies
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/chats", chatRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

const server = app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	connectDB();
});

const io = new Server(server, {
	pingTimeout: 60000,
	cors: {
	  origin: "http://localhost:5173"||"http://192.168.29.72:5173",
	  // credentials: true,
	},
  });

  io.on("connection", (socket) => {
	console.log("A user connected:", socket.id);
  
	// Handle joining a chat room
	socket.on("joinChat", ({ userId, otherUserId }) => {
	  const room = [userId, otherUserId].sort().join("_"); // Create a unique room ID
	  socket.join(room);
	  console.log(`${userId} joined room: ${room}`);
	});
  
	// Handle sending messages
	socket.on("sendMessage", (messageData) => {
	  const room = [messageData.senderId, messageData.receiverId].sort().join("_"); // Ensure the same room ID
	  io.to(room).emit("receiveMessage", messageData);
	  console.log("Message sent to room:", room, messageData);
	});
  
	// Handle disconnection
	socket.on("disconnect", () => {
	  console.log("A user disconnected:", socket.id);
	});
  });
  