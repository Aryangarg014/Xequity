import React, { useState } from "react";
import axios from "axios";
import styles from "./CreatePost.module.css";

const CreatePost = ({ useremail, username }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // Array of files
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // When image is clicked, apply overflow hidden to body to prevent scrolling
    document.body.style.overflow = 'hidden';
  };

  const closeImagePopup = () => {
    setSelectedImage(null);
    // Restore scrolling when popup is closed
    document.body.style.overflow = '';
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    if (!title || !content) {
      setError("Title and content are required");
      return;
    }
  
    setIsSubmitting(true);
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
      setSuccess("Post created successfully!");
      setTitle("");
      setContent("");
      setImages([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError("Failed to create post. Please try again.");
      console.error("Post creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <div className={styles.container}>
        <h2>Create a Post</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter title for your post"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
          />
          
          <textarea
            placeholder="Share your thoughts, ideas, or questions..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textarea}
          />
          
          <div className={styles.fileSection}>
            <div className={styles.fileInputWrapper}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className={styles.fileInput}
                id="file-input"
              />
              <label htmlFor="file-input" className={styles.fileInputLabel}>
                📷 Upload Image
              </label>
            </div>
            
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
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.loadingSpinner}></span> Creating...
              </>
            ) : (
              "Create Post"
            )}
          </button>
        </form>
      </div>
      
      {/* Image popup rendered outside the container */}
      {selectedImage && (
        <div className={styles.imagePopup} onClick={closeImagePopup}>
          <div className={styles.imagePopupContent} onClick={(e) => e.stopPropagation()}>
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
    </>
  );
};

export default CreatePost;