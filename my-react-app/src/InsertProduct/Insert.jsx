import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Insert.module.css";

function Insert() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    tags: [""], // Tags stored as an array of strings
    team: [{ name: "", position: "" }],
  });
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle changes in the tags array
  const handleTagChange = (index, e) => {
    const updatedTags = [...formData.tags];
    updatedTags[index] = e.target.value;
    setFormData({ ...formData, tags: updatedTags });
  };

  // Add a new tag field
  const addTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, ""] });
  };

  // Remove a tag field
  const removeTag = (index) => {
    const updatedTags = [...formData.tags];
    updatedTags.splice(index, 1);
    setFormData({ ...formData, tags: updatedTags });
  };

  // Handle team member input changes
  const handleTeamChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTeam = [...formData.team];
    updatedTeam[index][name] = value;
    setFormData({ ...formData, team: updatedTeam });
  };

  // Add a new team member
  const addTeamMember = () => {
    setFormData({ ...formData, team: [...formData.team, { name: "", position: "" }] });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 1) {
      setError("Please upload at least one image.");
      return;
    }
    setImageFiles(files);
    setError("");
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure required fields are not empty
    if (!formData.productName || !formData.description || formData.tags.length === 0 || imageFiles.length < 1 || !email) {
      setError("All fields and at least one image are required.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("productName", formData.productName);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("email", email);
    
    // Add tags as an array
    formData.tags.forEach((tag, index) => {
      formDataToSend.append(`tags[${index}]`, tag);
    });

    // Add team members
    formData.team.forEach((member, index) => {
      formDataToSend.append(`team[${index}][name]`, member.name);
      formDataToSend.append(`team[${index}][position]`, member.position);
    });
    
    // Add images
    imageFiles.forEach((file) => {
      formDataToSend.append("images", file);
    });

    try {
      await axios.post("http://localhost:3001/add-product", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate(`/company/${email}`);
    } catch (err) {
      console.error("Error response:", err.response);
      setError("Failed to add product. Try again later.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add Product</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="productName" placeholder="Product Name" value={formData.productName} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />

        <h3>Tags</h3>
        {formData.tags.map((tag, index) => (
          <div key={index}>
            <input 
              type="text" 
              placeholder="Tag" 
              value={tag} 
              onChange={(e) => handleTagChange(index, e)} 
              required 
            />
            {formData.tags.length > 1 && (
              <button type="button" onClick={() => removeTag(index)}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addTag}>+ Add Tag</button>

        <h3>Team Members</h3>
        {formData.team.map((member, index) => (
          <div key={index}>
            <input type="text" name="name" placeholder="Name" value={member.name} onChange={(e) => handleTeamChange(index, e)} required />
            <input type="text" name="position" placeholder="Position" value={member.position} onChange={(e) => handleTeamChange(index, e)} required />
          </div>
        ))}
        <button type="button" onClick={addTeamMember}>+ Add Team Member</button>
        
        <h3>Upload Images</h3>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} required />
        
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Insert;
