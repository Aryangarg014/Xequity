import React, { useState } from "react";
import axios from "axios";
import styles from "./CreatePost.module.css";

const CreatePost = ({ useremail, username }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");


  const handleImageChange = (e) => {
    setImage([...e.target.files]); // Store multiple files in state
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!title || !content) {
      setError("Title and content are required");
      return;
    }
  
    const formData = new FormData();
    formData.append("email", useremail);
    formData.append("name", username);
    formData.append("title", title);
    formData.append("content", content);
    
    if (image.length > 0) {
      image.forEach((file) => formData.append("images", file)); // Append multiple files
    }
  
    try {
      await axios.post("http://localhost:3001/create-post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Post created successfully!");
      setTitle("");
      setContent("");
      setImage([]);
    } catch (error) {
      setError("Failed to create post");
      console.error("Post creation error:", error);
    }
  };
  
  
  return (
    <div className={styles.container}>
      <h2>Create a Post</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textarea}
        ></textarea>
        <input type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
        <button type="submit" className={styles.button}>Create Post</button>
      </form>
    </div>
  );
};

export default CreatePost;