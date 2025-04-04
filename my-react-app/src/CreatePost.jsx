import React, { useState } from "react";
import axios from "axios";
import styles from "./CreatePost.module.css";

const CreatePost = ({ useremail, username }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // Changed to array of files
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Get single file
    if (file) {
      setImages(prevImages => [...prevImages, file]);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleImageClick = (file) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
  };

  const closeImagePopup = () => {
    setSelectedImage(null);
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
    
    images.forEach((file) => formData.append("images", file));
  
    try {
      await axios.post("http://localhost:3001/create-post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Post created successfully!");
      setTitle("");
      setContent("");
      setImages([]);
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
        />
        <div className={styles.fileSection}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className={styles.fileInput}
          />
          {images.length > 0 && (
            <div className={styles.selectedFiles}>
              {images.map((file, index) => (
                <div key={index} className={styles.fileItem}>
                  <span 
                    className={styles.fileName}
                    onClick={() => handleImageClick(file)}
                  >
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Image Popup */}
        {selectedImage && (
          <div className={styles.imagePopup} onClick={closeImagePopup}>
            <div className={styles.imagePopupContent}>
              <img src={selectedImage} alt="Preview" />
              <button 
                className={styles.closePopup}
                onClick={closeImagePopup}
              >
                ×
              </button>
            </div>
          </div>
        )}
        <button type="submit" className={styles.button}>Create Post</button>
      </form>
    </div>
  );
};

export default CreatePost;