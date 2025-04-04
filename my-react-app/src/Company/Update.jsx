import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import axios from "axios";
import styles from "./Update.module.css"; // Ensure CSS file exists

const UpdateProduct = () => {
    const { email } = useParams(); 
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        productName: "",
        description: "",
        tags: [],
        team: [],
        images: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newTag, setNewTag] = useState("");  // For adding a single tag
    const [newMember, setNewMember] = useState({ name: "", position: "" }); // For new team member

    useEffect(() => {
        axios.get(`http://localhost:3001/product/${email}`)
            .then(response => {
                if (response.data.status === "Success" && response.data.product) {
                    setProduct({ 
                        productName: response.data.product.productName || "", 
                        description: response.data.product.description || "",
                        tags: response.data.product.tags || [], 
                        team: response.data.product.team || [],
                        email: response.data.product.email || "",
                    });
                } else {
                    setError("Failed to load product details.");
                }
            })
            .catch(error => {
                console.error("Error fetching product:", error);
                setError("Error fetching product details. Try again later.");
            })
            .finally(() => setLoading(false));
    }, [email]);
    

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    // Add Tag Function
    const handleAddTag = () => {
        if (newTag.trim() !== "" && !product.tags.includes(newTag.trim())) {
            setProduct({ ...product, tags: [...product.tags, newTag.trim()] });
            setNewTag(""); // Clear input after adding
        }
    };

    // Remove Tag Function
    const handleRemoveTag = (tagToRemove) => {
        setProduct({
            ...product,
            tags: product.tags.filter(tag => tag !== tagToRemove)
        });
    };

    // Add Team Member Function
    const handleAddTeamMember = () => {
        if (newMember.name.trim() !== "" && newMember.position.trim() !== "") {
            setProduct({ ...product, team: [...product.team, newMember] });
            setNewMember({ name: "", position: "" }); // Clear input after adding
        }
    };

    // Remove Team Member Function
    const handleRemoveTeamMember = (index) => {
        setProduct({
            ...product,
            team: product.team.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`http://localhost:3001/update-product/${email}`, product)
            .then(response => {
                if (response.data.status === "Success") {
                    alert("Product updated successfully!");
                    navigate(`/company/${email}`);
                } else {
                    setError("Failed to update product.");
                }
            })
            .catch(error => {
                console.error("Error updating product:", error);
                setError("Error updating product. Try again later.");
            });
    };

    return (
        <div className={styles.container}>
            <h2>Update Product</h2>
            {loading ? (
                <p>Loading product details...</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label>Product Name:</label>
                    <input
                        type="text"
                        name="productName"
                        value={product.productName}
                        onChange={handleChange}
                        required
                    />

                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        required
                    />

                    {/* Tags Section */}
                    <label>Tags:</label>
                    <div className={styles.tagInputContainer}>
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add new tag"
                        />
                        <button type="button" onClick={handleAddTag} className={styles.addButton}>
                            Add
                        </button>
                    </div>

                    {/* Display Existing Tags */}
                    <div className={styles.tagList}>
                        {product.tags.map((tag, index) => (
                            <div key={index} className={styles.tag}>
                                {tag} <button type="button" onClick={() => handleRemoveTag(tag)}>Remove</button>
                            </div>
                        ))}
                    </div>

                    {/* Team Members Section */}
                    <h3>Team Members</h3>
                    {product.team.map((member, index) => (
                        <div key={index} className={styles.teamMember}>
                            <span>{member.name} - {member.position}</span>
                            <button type="button" onClick={() => handleRemoveTeamMember(index)}>Remove Member</button>
                        </div>
                    ))}

                    {/* Add New Team Member */}
                    <label>Add New Team Member:</label>
                    <div className={styles.teamInputContainer}>
                        <input
                            type="text"
                            placeholder="Name"
                            value={newMember.name}
                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Position"
                            value={newMember.position}
                            onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                        />
                        <button type="button" onClick={handleAddTeamMember} className={styles.addButton}>
                            Add Member
                        </button>
                    </div>

                    <label>Email (Cannot be changed):</label>
                    <input
                        type="email"
                        name="email"
                        value={product.email}
                        disabled
                    />

                    <button type="submit" className={styles.submitButton}>
                        Update Product
                    </button>
                </form>
            )}
        </div>
    );
};

export default UpdateProduct;
