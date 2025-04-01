import React, { useEffect, useState } from "react";
import styles from "./Forum.module.css";
import axios from "axios";

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3001/posts")
      .then((response) => {
        console.log(response.data); // Debugging
        if (response.data.status === "Success") {
          setPosts(response.data.posts);
        } else {
          console.error("Failed to fetch posts");
        }
      })
      .catch((error) => console.error("Error fetching posts:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleUpvote = async (postId) => {
    try {
      const response = await axios.post(`http://localhost:3001/posts/${postId}/upvote`);
      console.log(response.data); // Debugging

      if (response.data.status === "Success") {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? { ...post, upvotes: response.data.post.upvotes } : post
          )
        );
      } else {
        console.error("Failed to upvote post");
      }
    } catch (error) {
      console.error("Error upvoting post:", error);
    }
  };

  return (
    <div className={styles.maindiv}>
      <h2 className={styles.heading}>Community Posts</h2>
      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} className={styles.postContainer}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <p>Upvotes: {post.upvotes}</p>

            {/* Display all images in a grid layout */}
            <div className={styles.imageGrid}>
              {post.image && post.image.length > 0 &&
                post.image.map((imgSrc, index) => (
                  <img 
                    key={index}
                    src={`http://localhost:3001${imgSrc}`} 
                    alt="Post" 
                    className={styles.postImage}
                  />
                ))
              }
            </div>

            <button onClick={() => handleUpvote(post._id)}>Upvote</button>
          </div>
        ))
      )}
    </div>
  );
};

export default PostsPage;
