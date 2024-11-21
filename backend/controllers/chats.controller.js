// import Conversation from "../models/conversation.model.js";
import chat from "../models/chats.model.js";
// import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
      // console.log("Request Body:", req.body);  // Logging the request body for debugging
      
      const { senderId, receiverId, content } = req.body;

      // Check if all required fields are present
      if (!senderId || !receiverId || !content) {
          return res.status(400).json({ error: "Missing required fields" });
      }

      const message = new chat({ senderId, receiverId, content });
      await message.save();

      console.log("Saved Message:", message); // Logging the saved message for debugging
      res.status(201).json({ message: "Message sent successfully", data: message });
  } catch (error) {
      console.error("Error saving message:", error); // Logs the error if saving fails
      res.status(500).json({ error: "Internal server error" });
  }
};


export const getMessages = async (req, res) => {
    try {
        const { userId, otherUserId } = req.params;
        console.log(req.params)
        const messages = await chat.find({
          $or: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        }).sort("timestamp");
        res.status(200).json({ messages });
      } catch (error) {
        res.status(500).json({ error: "Error retrieving messages" });
      }
};