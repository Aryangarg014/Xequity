import React, { useEffect, useState } from "react";
import styles from "./Forum.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const PostsPage = ({ useremail, username }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [visibleComments, setVisibleComments] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    axios
      .get("http://localhost:3001/posts")
      .then((response) => {
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
    if (!useremail) {
      console.error("User email is undefined. Cannot proceed with upvote.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/posts/${postId}/${useremail}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (data.status === "Success") {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? { ...post, upvotes: data.count } : post
          )
        );
      } else {
        console.error("Failed to upvote post:", data.message);
      }
    } catch (error) {
      console.error("Error upvoting post:", error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!useremail || !username) {
      console.error("User email or username is undefined. Cannot add comment.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3001/posts/${postId}/comment`,
        {
          email: useremail,
          text: commentText,
        }
      );

      if (response.data.status === "Success") {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  comments: [
                    ...post.comments,
                    { email: useremail, name: username, text: commentText },
                  ],
                }
              : post
          )
        );
        setCommentText("");
      } else {
        console.error("Failed to add comment:", response.data.message);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleComments = (postId) => {
    setVisibleComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  return (
    <div className={styles.maindiv}>
      <div className={styles.header}>
        <button
          onClick={() => navigate("/CreatePost")}
          className={styles.activityButton}
        >
          Make Post
        </button>
        <button
          onClick={() => navigate("/CreatePost")}
          className={styles.activityButton}
        >
          My Activity
        </button>
      </div>
      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} className={styles.postContainer}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>

            <div className={styles.imageGrid}>
              {post.image &&
                post.image.length > 0 &&
                post.image.map((imgSrc, index) => (
                  <img src={imgSrc.startsWith("http") ? imgSrc : `http://localhost:3001${imgSrc}`} alt="Post" className={styles.postImage}
                  />
                ))}
            </div>

            <p>Upvotes: {post.upvotes}</p>
            <button onClick={() => handleUpvote(post._id)}>Upvote</button>
            <button onClick={() => toggleComments(post._id)} className={styles.CommentsButton}>
              {visibleComments[post._id] ? "Hide Comments" : "View Comments"}
            </button>

            {visibleComments[post._id] && (
              <div className={styles.commentsSection}>
                <h4>Comments:</h4>
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment, index) => (
                    <p key={index}>
                      <strong>{comment.name || comment.email}:</strong>{" "}
                      {comment.text}
                    </p>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}

                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className={styles.commentInput}
                />
                <button onClick={() => handleAddComment(post._id)} className={styles.CommentsButton}>
                  Comment
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PostsPage;
