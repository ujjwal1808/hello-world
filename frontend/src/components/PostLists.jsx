import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:5000");

const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    socket.on("new-post", (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    });

    return () => {
      socket.off("new-post");
    };
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <div key={post._id} className="post">
          <h4>{post.author.name}</h4>
          <p>{post.content}</p>
          {post.image && <img src={post.image} alt="Post visual" />}
          <p>{new Date(post.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default PostList;
