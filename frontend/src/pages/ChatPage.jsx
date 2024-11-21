import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:8000";
let socket;

const ChatPage = () => {
  const { username } = useParams();
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: () => axiosInstance.get("/auth/user"),
  });

  const { data: connections } = useQuery({
    queryKey: ["connections"],
    queryFn: () => axiosInstance.get("/connections"),
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  
  // Ref for chat container to scroll to bottom
  const messagesEndRef = useRef(null);
  
  // State to track unread messages for each user
  const [unreadMessages, setUnreadMessages] = useState({});

  const fetchMessages = async (userId, otherUserId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/chats/send/${userId}/${otherUserId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("jwt-linkedin")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setMessages([]); // Clear messages when selecting a new user
    setUnreadMessages((prevUnreadMessages) => {
      // Mark messages as read when the user clicks on them
      const updatedUnreadMessages = { ...prevUnreadMessages };
      delete updatedUnreadMessages[user._id]; // Remove from unread
      return updatedUnreadMessages;
    });
  };

  useEffect(() => {
    socket = io(ENDPOINT);
  
    // Join the chat room when a user is selected
    if (selectedUser) {
      const room = [authUser._id, selectedUser._id].sort().join("_"); // Create a unique room ID
      socket.emit("joinChat", { userId: authUser._id, otherUserId: selectedUser._id });
  
      // Fetch chat history
      fetchMessages(authUser._id, selectedUser._id);
  
      // Listen for new messages in the room
      socket.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    }
  
    // Cleanup
    return () => {
      socket.off("receiveMessage");
      socket.disconnect(); // Ensure the socket disconnects properly
    };
  }, [selectedUser, authUser]);
  
console.log(connections);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && selectedUser) {
      const messageData = {
        senderId: authUser._id,
        receiverId: selectedUser._id,
        content: input,
      };
  
      socket.emit("sendMessage", messageData);
      setInput("");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="bg-white w-64 h-full p-4 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Chats</h2>
        <div className="space-y-4">
          {connections?.data?.map((user) => (
            
            <div
              key={user._id}
              onClick={() => handleUserClick(user)}
              className={`flex items-center p-2 rounded-lg cursor-pointer ${
                selectedUser?._id === user._id
                  ? "bg-primary text-white"
                  : unreadMessages[user._id] > 0
                  ? "bg-yellow-100" // Highlight unread messages
                  : "hover:bg-gray-100"
              }`}
            >
              <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
              </div>''
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center justify-between p-4 bg-primary text-white shadow-md">
          <h2 className="text-xl font-bold">{selectedUser ? selectedUser.name : "Select a User"}</h2>
        </div>

        <div className="flex flex-col flex-1 p-4 overflow-y-auto space-y-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.senderId === authUser._id ? "self-end bg-primary" : "self-start bg-gray-300"
              } rounded-lg p-2 px-4 text-white max-w-xs`}
            >
              {message.content}
            </div>
          ))}
          {/* This div will be used to scroll to the bottom */}
          <div ref={messagesEndRef} />
        </div>

        <div >
        <form className="flex items-center p-4 bg-gray-200" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors m-1"
            disabled={!selectedUser}
          >
            Send
          </button></form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
