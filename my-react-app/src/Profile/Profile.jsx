import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./Profile.module.css";
import myImage from "../assets/Investor.png";
import { useNavigate } from "react-router-dom";

function Profile() {
    const { email } = useParams(); // Get the email from the route parameter
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate
    const [profilePic, setProfilePic] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [newTag, setNewTag] = useState("");
    // ✅ State for storing pending & approved requests (For Admins)
    const [userData, setUserData] = useState(null);
    const [pendingProducts, setPendingProducts] = useState([]);
const [approvedProducts, setApprovedProducts] = useState([]);
const [selectedTab, setSelectedTab] = useState("pending");
const [pendingUsers, setPendingUsers] = useState([]);
const [approvedUsers, setApprovedUsers] = useState([]);

  useEffect(() => {
    // Fetch profile info (including type)
    axios.get(`http://localhost:3001/profile/${email}`)
        .then(response => {
            if (response.data.status === "Success" && response.data.profile) {
                setUserData(response.data.profile);
            }
        })
        .catch(error => console.error("Error fetching profile info:", error));
}, [email]);

    ///////////     code for tags   //////////////
    
    const handleTagChange = (e) => {
        setNewTag(e.target.value);
    };

    const addTag = (e) => {
        e.preventDefault(); // ✅ Prevents page refresh
    
        if (newTag.trim() !== "" && !formData.tags.includes(newTag)) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, newTag], 
            }));
            setNewTag(""); // Clears the input field after adding
        }
    };
    
    
    const removeTag = (index) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index), // ✅ Remove tag from array
        }));
    };
    


useEffect(() => {
    if (userData?.type === "admin") {
        // Fetch pending products
        axios.get("http://localhost:3001/admin/pending-products")
            .then(response => setPendingProducts(response.data))
            .catch(error => console.error("Error fetching pending products:", error));

        // Fetch approved products
        axios.get("http://localhost:3001/admin/approved-products")
            .then(response => setApprovedProducts(response.data))
            .catch(error => console.error("Error fetching approved products:", error));

            axios.get("http://localhost:3001/pending-users")
            .then(response => setPendingUsers(response.data))
            .catch(error => console.error("Error fetching pending users:", error));

        axios.get("http://localhost:3001/approved-users")
            .then(response => setApprovedUsers(response.data))
            .catch(error => console.error("Error fetching approved users:", error));
    }
}, [userData]);

   // ✅ Fetch Pending & Approved Requests (Only for Admins)
   

  
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select an image to upload");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", selectedFile);
    formData.append("email", email);

    try {
      const response = await axios.post("http://localhost:3001/profile/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "Success") {
        setProfilePic(response.data.profilePic.profilePic);  // Update profile pic in the state
        setUploadStatus("Profile picture uploaded successfully!");
      } else {
        setUploadStatus("Failed to upload profile picture");
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setUploadStatus("Error uploading profile picture");
    }
  };


    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: email,
        mobile: "",
        headline: "",
        experience: [], // Array for experience
        education: [], // Array for education
        location: "",
        description: "",
        tags: [],
    });

    const [newEducation, setNewEducation] = useState({
        schoolName: "",
        startYear: "",
        endYear: "",
        courseName: "",
    });

    const [newExperience, setNewExperience] = useState({
        companyName: "",
        role: "",
        startYear: "",
        endYear: "",
    });

    useEffect(() => {
        if (email) {
            axios
                .get(`http://localhost:3001/profile/${email}`)
                .then((response) => {
                    if (response.data.status === "Success" && response.data.profile) {
                        setFormData(response.data.profile);
                    }
                })
                .catch((err) => console.error("Error fetching profile:", err));
        }
    }, [email]);
    // function to approve pending users
    const handleApproveUser = async (userEmail) => {
        try {
            const response = await axios.post(`http://localhost:3001/admin/approve-user/${userEmail}`);
            
            if (response.data.status === "Success") {
                // Update state
                setPendingUsers(prev => prev.filter(user => user.email !== userEmail));
                setApprovedUsers(prev => [...prev, response.data.user]);
                alert("User approved successfully!");
            }
        } catch (error) {
            console.error("Error approving user:", error);
            alert(error.response?.data?.message || "Failed to approve user");
        }
    };

    //  Add the handleRejected function (if needed)
const handleRejected = async (userEmail) => {
    try {
        // You'll need to implement this endpoint in your backend
        const response = await axios.post(`http://localhost:3001/admin/reject-user/${userEmail}`);
        
        if (response.data.status === "Success") {
            setPendingUsers(prev => prev.filter(user => user.email !== userEmail));
        }
    } catch (error) {
        console.error("Error rejecting user:", error);
        alert("Failed to reject user. Please try again.");
    }
};
    
    
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEducationChange = (e) => {
        const { name, value } = e.target;
        setNewEducation((prev) => ({ ...prev, [name]: value }));
    };

    const handleExperienceChange = (e) => {
        const { name, value } = e.target;
        setNewExperience((prev) => ({ ...prev, [name]: value }));
    };

    const addEducation = () => {
        setFormData((prev) => ({
            ...prev,
            education: [...prev.education, newEducation],
        }));
        setNewEducation({ schoolName: "", startYear: "", endYear: "", courseName: "" });
    };

    const addExperience = () => {
        setFormData((prev) => ({
            ...prev,
            experience: [...prev.experience, newExperience],
        }));
        setNewExperience({ companyName: "", role: "", startYear: "", endYear: "" });
    };

    const handleApprove = async (email) => {
        try {
            const response = await axios.post(`http://localhost:3001/admin/approve-product/${email}`);
            {console.log(email)}
            if (response.data.status === "Success") {

                setPendingProducts(pendingProducts.filter(p => p._id !== email)); // Remove from pending
                setApprovedProducts([...approvedProducts, response.data.product]); // Add to approved list
            }
        } catch (error) {
            console.error("Error approving product:", error);
        }
    };
    
    const handleSave = () => {
        axios
            .post("http://localhost:3001/profile", formData)
            .then((response) => {
                if (response.data.status === "Success") {
                    setIsEditing(false);
                }
            })
            .catch((err) => console.error("Error saving profile:", err));
    };
    // ✅ Admin-Specific UI (Tables for Pending & Approved Requests)
    if (userData?.type === "admin") {
        return (
            <div className={styles.profileContainer}>
                <h2>Admin Dashboard</h2>
                
                {/* Sidebar for Admin Navigation */}
                <div className={styles.adminSidebar}>
                    <button className={styles.tabButton} onClick={() => setSelectedTab("pending")}>Pending Products</button>
                    <button className={styles.tabButton} onClick={() => setSelectedTab("approved")}>Approved Products</button>
                    <button className={styles.tabButton} onClick={() => setSelectedTab("pendingUsers")}>Pending Users</button>
                    <button className={styles.tabButton} onClick={() => setSelectedTab("approvedUsers")}>Approved Users</button>
                </div>
                
                {/* Main Content Area */}
                <div className={styles.adminContent}>
                    {selectedTab === "pending" && (
                        <div>
                            <h3>Pending Products</h3>
                            <section className={styles.container}>
                                {pendingProducts.length > 0 ? (
                                    pendingProducts.map((product) => (
                                        <div className={styles.content} key={product._id}>
                                            {/* Product Image */}
                                            <div className={styles.logo}>
                                                <img src={product.images && product.images.length > 0 ? product.images[0] : pfp2} 
                                                    alt="Product Image" 
                                                    className={styles.productImage} 
                                                />
                                            </div>
                                            
                                            {/* Product Details */}
                                            <div className={styles.specification}>
                                                <ul className={styles.aboutItems}>
                                                    <li className={styles.aboutItem}>
                                                        <div className={styles.aboutItemText}>
                                                            <h2>{product.productName}</h2>
                                                            <p><strong>Description:</strong> {product.description}</p>
                                                            <p><strong>Tags:</strong> {product.tags ? product.tags.join(', ') : 'No tags available'}</p>
                                                            <p><strong>Team Members:</strong> {product.team && product.team.length > 0 ? product.team.map(member => member.name).join(', ') : 'No team members'}</p>
                                                            <p><strong>Email:</strong> {product.email}</p>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                            
                                            {/* Approve & Reject Buttons */}
                                            <div className={styles.actionButtons}>
                                                <button className={styles.approveBtn} onClick={() => handleApprove(product._id)}>Approve</button>
                                                <button className={styles.rejectBtn}>Reject</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noResults}>No pending products</p>
                                )}
                            </section>
                        </div>
                    )}
                    
                    {selectedTab === "approved" && (
                        <div>
                            <h3>Approved Products</h3>
                            <section className={styles.container}>
                                {approvedProducts.length > 0 ? (
                                    approvedProducts.map((product) => (
                                        <div className={styles.content} key={product._id}>
                                            {/* Product Image */}
                                            <div className={styles.logo}>
                                                <img src={product.images && product.images.length > 0 ? product.images[0] : pfp2} 
                                                    alt="Product Image" 
                                                    className={styles.productImage} 
                                                />
                                            </div>
                                            
                                            {/* Product Details */}
                                            <div className={styles.specification}>
                                                <ul className={styles.aboutItems}>
                                                    <li className={styles.aboutItem}>
                                                        <div className={styles.aboutItemText}>
                                                            <h2>{product.productName}</h2>
                                                            <p><strong>Description:</strong> {product.description}</p>
                                                            <p><strong>Tags:</strong> {product.tags ? product.tags.join(', ') : 'No tags available'}</p>
                                                            <p><strong>Team Members:</strong> {product.team && product.team.length > 0 ? product.team.map(member => member.name).join(', ') : 'No team members'}</p>
                                                            <p><strong>Email:</strong> {product.email}</p>
                                                            <p><strong>Approved On:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noResults}>No approved products</p>
                                )}
                            </section>
                        </div>
                    )}
                    {selectedTab === "pendingUsers" && (
                        <div>
                            <h3>Pending Users</h3>
                            <ul>
                                {pendingUsers.length > 0 ? (
                                    pendingUsers.map(user => (
                                        <li key={user.email}>
                                            <p><strong>Name:</strong> {user.name}</p>
                                            <p><strong>Email:</strong> {user.email}</p>
                                            <p><strong>Email:</strong> {user.type}</p>
                                            <a href={`http://localhost:3001/${user.pdfFile}`} target="_blank" rel="noopener noreferrer">
                                                View PDF
                                            </a>

                                            <button
                                                        className={styles.approveBtn}
                                                        onClick={() => {
                                                            // console.log("Approving user:", user.email);  // ✅ Debugging
                                                            handleApproveUser(user.email);
                                                        }}
                                                        >
                                                        Approve
                                                        </button>

                                            <button className={styles.rejectBtn} onClick={() => handleRejected(user.email)}>Reject</button>
                                        </li>
                                    ))
                                ) : (
                                    <p className={styles.noResults}>No pending users</p>
                                )}
                            </ul>
                        </div>
                    )}
                    
                    {selectedTab === "approvedUsers" && (
                        <div>
                            <h3>Approved Users</h3>
                            <ul>
                                {approvedUsers.length > 0 ? (
                                    approvedUsers.map(user => (
                                        <li key={user.email}>{user.name} - {user.email}</li>

                                    ))
                                ) : (
                                    <p className={styles.noResults}>No approved users</p>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.profileContainer} >
            {/* Left Panel */}
            <div className={styles.leftPanel}>
                <button
            onClick={() => navigate(`/MyInvestment/${email}`)}
            >
            My Investment
            </button>
            <h2>Profile Picture</h2>

            {profilePic ? (
          <img src={profilePic} alt="Profile" className={styles.aboutImage}/>
        ) : (
            <img src={myImage} alt="Investor" className={styles.aboutImage} />
        )}


{uploadStatus && <p>{uploadStatus}</p>}
                
                <h2>User Details</h2>
                <ul className={styles.userInfo}>
                    <li>
                        <span className={styles.label}>Name:</span>
                        <span className={styles.value}>{formData.firstName || "Guest"}</span>
                    </li>
                    <li>
                        <span className={styles.label}>Email:</span>
                        <span className={styles.value}>{formData.email}</span>
                    </li>
                </ul>
                <form onSubmit={handleUpload}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button type="submit">Upload Profile Picture</button>
        </form>
        
            </div>

            {/* Right Panel */}
            <div className={styles.rightPanel}>
                <h3>Welcome to your profile page!</h3>

                {!isEditing ? (
                    <>
                        <div className={styles.detailsSection}>
                            <div>
                                <h4 className={styles.sectionHeading}>First Name</h4>
                                <div className={styles.sectionData}>{formData.firstName || "N/A"}</div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Last Name</h4>
                                <div className={styles.sectionData}>{formData.lastName || "N/A"}</div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Mobile</h4>
                                <div className={styles.sectionData}>{formData.mobile || "N/A"}</div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Headline</h4>
                                <div className={styles.sectionData}>{formData.headline || "N/A"}</div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Experience</h4>
                                <div className={styles.sectionData}>
                                {formData.experience.length > 0 ? (
                                    <ul>
                                        <div className={styles.educationList}>

                                        {formData.experience.map((exp, index) => (
                                            <li key={index} className={styles.education}>
                                                {exp.companyName} ({exp.startYear} - {exp.endYear}) - {exp.role}
                                            </li>
                                        ))}
                                        </div>
                                    </ul>
                                ) : (
                                    <div className={styles.sectionData}>N/A</div>
                                )}
                                </div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Education</h4>
                                <div className={styles.sectionData}>
                                {formData.education.length > 0 ? (
                                    <ul>
                                        <div className={styles.educationList}>
                                        {formData.education.map((edu, index) => (
                                            <li key={index} className={styles.education}>
                                                {edu.schoolName} ({edu.startYear} - {edu.endYear}) - {edu.courseName}
                                            </li>
                                        ))}</div>
                                    </ul>
                                ) : (
                                    <div className={styles.sectionData}>N/A</div>
                                )}
                                </div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Location</h4>
                                <div className={styles.sectionData}>{formData.location || "N/A"}</div>
                            </div>

                            <div>
                                <h4 className={styles.sectionHeading}>Description</h4>
                                <div className={styles.sectionData}>{formData.description || "N/A"}</div>
                            </div>
                            <div>
                            <h4 className={styles.sectionHeading}>Tags</h4>
                            <div className={styles.sectionData}>
                                {formData.tags.length > 0 ? (
                                    <ul className={styles.educationList}> {/* Use the same class as education */}
                                        {formData.tags.map((tag, index) => (
                                            <li key={index} className={styles.education}> {/* Apply same styling */}
                                                {tag}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span>No tags available</span>
                                )}
                            </div>
                        </div>

                        </div>
                        
                        <div className={styles.editbutn}>
                        <button onClick={() => setIsEditing(true)} className={styles.updateButton}>
                            Edit
                        </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.editableSection}>
                        <form>
                            <label>
                                <h4 className={styles.sectionHeading}>First Name:</h4>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
                            </label>
                            <br />
                            <label>
                                <h4 className={styles.sectionHeading}>Last Name:</h4>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
                            </label>
                            <br />
                            <label>
                                <h4 className={styles.sectionHeading}>Mobile:</h4>
                                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} />
                            </label>
                            <br />
                            <label>
                                <h4 className={styles.sectionHeading}>Headline:</h4>
                                <input type="text" name="headline" value={formData.headline} onChange={handleChange} />
                            </label>
                            <br />
                            <h4 className={styles.sectionHeading}>Add Experience:</h4>
                            <label>
                                <input
                                    type="text"
                                    name="companyName"
                                    placeholder="Company Name"
                                    value={newExperience.companyName}
                                    onChange={handleExperienceChange}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    name="role"
                                    placeholder="Role"
                                    value={newExperience.role}
                                    onChange={handleExperienceChange}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    name="startYear"
                                    placeholder="Start Year"
                                    value={newExperience.startYear}
                                    onChange={handleExperienceChange}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    name="endYear"
                                    placeholder="End Year"
                                    value={newExperience.endYear}
                                    onChange={handleExperienceChange}
                                />
                            </label>
                            <button type="button" onClick={addExperience} className={styles.addButton}>
                                Add Experience
                            </button>
                            <br />
                            <h4 className={styles.sectionHeading}>Add Education:</h4>
                            <label>
                                <input
                                    type="text"
                                    name="schoolName"
                                    placeholder="School Name"
                                    value={newEducation.schoolName}
                                    onChange={handleEducationChange}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    name="startYear"
                                    placeholder="Start Year"
                                    value={newEducation.startYear}
                                    onChange={handleEducationChange}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    name="endYear"
                                    placeholder="End Year"
                                    value={newEducation.endYear}
                                    onChange={handleEducationChange}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    name="courseName"
                                    placeholder="Course Name"
                                    value={newEducation.courseName}
                                    onChange={handleEducationChange}
                                />
                            </label>
                            <button type="button" onClick={addEducation} className={styles.addButton}>
                                Add Education
                            </button>
                            <br />
                            <label>
                                <h4 className={styles.sectionHeading}>Location:</h4>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} />
                            </label>
                            <br />
                            <label>
                                <h4 className={styles.sectionHeading}>Description:</h4>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                />
                            </label>
                            <br />
                            <label>
                            <h4 className={styles.sectionHeading}>Tags:</h4>
                            <input
                            type="text"
                            value={newTag}
                            onChange={handleTagChange}
                            placeholder="Add new tag"
                            className={styles.tagInput}
                        />
                        <button className={styles.addTagButton} onClick={addTag}>Add</button>
                    
                            </label>
                            <button type="button" onClick={handleSave} className={styles.saveButton}>
                                Save
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
