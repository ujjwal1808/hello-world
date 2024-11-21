import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";

const PostPage = () => {
  const { postId } = useParams();
  const queryClient = useQueryClient();
  const [scheduledPostDate, setScheduledPostDate] = useState(null); // For the date picker
  const [content, setContent] = useState(""); // Content of the post
  const [commentContent, setCommentContent] = useState(""); // Comment content

  // Fetch the post data
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => axiosInstance.get(`/posts/${postId}`),
  });

  // Mutation to schedule the post
  const schedulePostMutation = useMutation({
    mutationFn: (scheduledData) =>
      axiosInstance.put(`/posts/${postId}/schedule`, scheduledData),
    onSuccess: () => {
      queryClient.invalidateQueries(["post", postId]);
      alert("Post scheduled successfully!");
    },
  });

  // Mutation to add a comment
  const addCommentMutation = useMutation({
    mutationFn: (commentData) =>
      axiosInstance.post(`/posts/${postId}/comments`, commentData),
    onSuccess: () => {
      queryClient.invalidateQueries(["post", postId]); // Refresh post data
      setCommentContent(""); // Clear comment field
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to add comment.");
    },
  });

  // Mutation to delete a comment
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) =>
      axiosInstance.delete(`/posts/${postId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["post", postId]);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to delete comment.");
    },
  });

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    if (!scheduledPostDate) {
      alert("Please select a date and time for scheduling.");
      return;
    }

    const data = { scheduledPostDate };

    // Call the mutation to schedule the post
    schedulePostMutation.mutate(data);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return alert("Comment cannot be empty.");
    addCommentMutation.mutate({ content: commentContent });
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (isLoading) return <div>Loading post...</div>;
  if (!post?.data) return <div>Post not found</div>;

  const postData = post.data;

  const isScheduled = postData.status === "scheduled";
  const scheduledDate = isScheduled ? new Date(postData.scheduledPostDate) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar />
      </div>
      <div className="col-span-1 lg:col-span-3">
        {/* Display Post */}
        <Post post={postData} />

        {/* Form to Schedule Post */}
        <form onSubmit={handleScheduleSubmit} className="mt-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            required
            className="w-full p-2 border rounded"
          />
          <div className="mt-2">
            <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700">
              Schedule Date and Time:
            </label>
            <DatePicker
              id="scheduleDate"
              selected={scheduledPostDate}
              onChange={(date) => setScheduledPostDate(date)}
              showTimeSelect
              dateFormat="Pp"
              minDate={new Date()} // Prevent selecting past dates
              className="w-full border p-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Schedule Post
          </button>
        </form>

        {/* Display Scheduled Information */}
        {isScheduled && scheduledDate && (
          <div className="mt-4 text-gray-600">
            <h3 className="text-lg font-semibold">Scheduled to go live on:</h3>
            <p>{scheduledDate.toLocaleString()}</p>
          </div>
        )}

        {/* Comment Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold">Comments</h3>
          <form onSubmit={handleAddComment} className="mt-4">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Comment
            </button>
          </form>

          {/* Display Comments */}
          {postData.comments?.length > 0 ? (
            <div className="mt-4 space-y-4">
              {postData.comments.map((comment) => (
                <div key={comment._id} className="border-b pb-2">
                  <p>
                    <strong>{comment.user.name}</strong>: {comment.content}
                  </p>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-500">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostPage;
