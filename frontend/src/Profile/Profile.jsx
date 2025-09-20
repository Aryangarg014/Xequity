import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./Profile.module.css";
import myImage from "../assets/Investor.png";
import pfp2 from "../../assests/propfp2.jpg";
import { useNavigate } from "react-router-dom";


function Profile() {
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [showRejectUserModal, setShowRejectUserModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [currentRejectUserEmail, setCurrentRejectUserEmail] = useState("");
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
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState("");

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReasons, setRejectReasons] = useState([]);
    const [currentRejectProductId, setCurrentRejectProductId] = useState("");
    const [showRejectSuccessModal, setShowRejectSuccessModal] = useState(false);


    const rejectionOptions = [
        "Incomplete product description",
        "Invalid team details",
        "Missing financial data",
        "Unclear goals or roadmap",
        "Low-quality or missing images",
    ];

    console.log(email)


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


    // part to fetch private key and account address


    const [accountInfo, setAccountInfo] = useState({ accountAddress: '', privateKey: '' });


    useEffect(() => {
        const fetchAccountDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/usertoken/${email}`);
                setAccountInfo({
                    accountAddress: res.data.accountAddress,
                    privateKey: res.data.privateKey
                });
            } catch (err) {
                console.error('Failed to fetch account info:', err);
            }
        };


        if (email) fetchAccountDetails();
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
            setActionLoading(true); // show loading popup
            const response = await axios.post(`http://localhost:3001/admin/approve-user/${userEmail}`);


            if (response.data.status === "Success") {
                // Update state
                setPendingUsers(prev => prev.filter(user => user.email !== userEmail));
                setApprovedUsers(prev => [...prev, response.data.user]);
                setAlertMessage("User approved successfully.");
                setShowAlert(true);
            }
        } catch (error) {
            console.error("Error approving user:", error);
            setActionMessage("Error approving user.");
        } finally {
            setActionLoading(false); // hide loading
        }
    };


    //  Add the handleRejected function (if needed)
    const handleRejected = async (userEmail) => {
        try {
            setActionLoading(true); // show loading popup
            // You'll need to implement this endpoint in your backend
            const response = await axios.post(`http://localhost:3001/admin/reject-user/${userEmail}`);


            if (response.data.status === "Success") {
                setPendingUsers(prev => prev.filter(user => user.email !== userEmail));
                setActionMessage("User rejected successfully."); // show message popup
            }
        } catch (error) {
            console.error("Error rejecting user:", error);
            setActionMessage("Error rejecting user.");
        }
        finally {
            setActionLoading(false); // hide loading
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
            { console.log(email) }
            if (response.data.status === "Success") {


                setPendingProducts(pendingProducts.filter(p => p._id !== email)); // Remove from pending
                setApprovedProducts([...approvedProducts, response.data.product]); // Add to approved list
                setAlertMessage("Product approved successfully.");
                setShowAlert(true);
            }
        } catch (error) {
            console.error("Error approving product:", error);
        }
    };

    const handleReject = async (productId) => {
        try {
            setActionLoading(true);
            const response = await axios.post(`http://localhost:3001/admin/reject-product/${productId}`);
            if (response.data.status === "Success") {
                setPendingProducts(prev => prev.filter(p => p._id !== productId));
                // setActionMessage("❌ Product rejected successfully!");
                // alert("Product rejected and user notified via email.");

                setAlertMessage("Product was rejected successfully.");
                setShowAlert(true);
            }
        } catch (error) {
            setActionMessage("❌ Failed to reject product.");
            console.error("Error rejecting product:", error);
        }
        finally {
            setActionLoading(false);
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
            <>
                {actionLoading && (
                    <div className={styles.popupOverlay}>
                        <div className={styles.popupBox}>
                            <span className={styles.loader}></span>
                            <p>Processing...</p>
                        </div>
                    </div>
                )}

                {actionMessage && (
                    <div className={styles.popupOverlay}>
                        <div className={styles.popupBox}>
                            <p>{actionMessage}</p>
                            <button onClick={() => setActionMessage("")}>OK</button>
                        </div>
                    </div>
                )}

                {showAlert && (
                    <div className={styles.popupOverlay}>
                        <div className={styles.popupBox}>
                            <p>{alertMessage}</p>
                            <button onClick={() => setShowAlert(false)}>OK</button>
                        </div>
                    </div>
                )}


                <div className={styles.adminProfileContainer}>
                    <div className={styles.adminHeader}>
                        <h2>Admin Dashboard</h2>
                        <p className={styles.adminSubtitle}>Manage products and user approvals</p>
                    </div>

                    {/* Sidebar for Admin Navigation */}
                    <div className={styles.adminSidebar}>
                        <button
                            className={`${styles.adminTabButton} ${selectedTab === "pending" ? styles.adminActive : ''}`}
                            onClick={() => setSelectedTab("pending")}
                        >
                            Pending Products ({pendingProducts.length})
                        </button>
                        <button
                            className={`${styles.adminTabButton} ${selectedTab === "approved" ? styles.adminActive : ''}`}
                            onClick={() => setSelectedTab("approved")}
                        >
                            Approved Products ({approvedProducts.length})
                        </button>
                        <button
                            className={`${styles.adminTabButton} ${selectedTab === "pendingUsers" ? styles.adminActive : ''}`}
                            onClick={() => setSelectedTab("pendingUsers")}
                        >
                            Pending Users ({pendingUsers.length})
                        </button>
                        <button
                            className={`${styles.adminTabButton} ${selectedTab === "approvedUsers" ? styles.adminActive : ''}`}
                            onClick={() => setSelectedTab("approvedUsers")}
                        >
                            Approved Users ({approvedUsers.length})
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className={styles.adminContent}>
                        {selectedTab === "pending" && (
                            <div className={styles.adminTabContent}>
                                <h3 className={styles.adminTabTitle}>Pending Products</h3>
                                <div className={styles.adminProductsGrid}>
                                    {pendingProducts.length > 0 ? (
                                        pendingProducts.map((product) => (
                                            <div className={styles.adminProductCard} key={product._id}>
                                                {/* Product Image */}
                                                <div className={styles.adminProductImageContainer}>
                                                    <img
                                                        src={product.profilePic || (product.images && product.images.length > 0 ? product.images[0] : pfp2)}
                                                        alt="Product Image"
                                                        className={styles.adminProductImage}
                                                    />
                                                </div>

                                                {/* Product Details */}
                                                <div className={styles.adminProductDetails}>
                                                    <h4 className={styles.adminProductName}>{product.productName}</h4>
                                                    <p className={styles.adminProductDescription}>
                                                        <strong>Description:</strong> {product.description}
                                                    </p>
                                                    <div className={styles.adminProductTags}>
                                                        <strong>Tags:</strong>
                                                        {product.tags && product.tags.length > 0 ? (
                                                            <div className={styles.adminTagsList}>
                                                                {product.tags.map((tag, index) => (
                                                                    <span key={index} className={styles.adminTag}>{tag}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className={styles.adminNoTags}>No tags available</span>
                                                        )}
                                                    </div>
                                                    <div className={styles.adminProductTeam}>
                                                        <strong>Team Members:</strong>
                                                        {product.team && product.team.length > 0 ? (
                                                            <div className={styles.adminTeamList}>
                                                                {product.team.map((member, index) => (
                                                                    <span key={index} className={styles.adminTeamMember}>{member.name}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className={styles.adminNoTeam}>No team members</span>
                                                        )}
                                                    </div>
                                                    <p className={styles.adminProductEmail}>
                                                        <strong>Email:</strong> {product.email}
                                                    </p>
                                                </div>

                                                {/* Approve & Reject Buttons */}
                                                <div className={styles.adminActionButtons}>
                                                    <button
                                                        className={styles.adminApproveBtn}
                                                        onClick={() => handleApprove(product._id)}
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                    <button
                                                        className={styles.adminRejectBtn}
                                                        onClick={() => {
                                                            setCurrentRejectProductId(product._id);
                                                            setRejectReasons([]);
                                                            setShowRejectModal(true);
                                                        }}
                                                    >
                                                        Reject
                                                    </button>

                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.adminEmptyState}>
                                            <div className={styles.adminEmptyIcon}>📋</div>
                                            <p className={styles.adminEmptyText}>No pending products</p>
                                            <p className={styles.adminEmptySubtext}>All products have been reviewed</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedTab === "approved" && (
                            <div className={styles.adminTabContent}>
                                <h3 className={styles.adminTabTitle}>Approved Products</h3>
                                <div className={styles.adminProductsGrid}>
                                    {approvedProducts.length > 0 ? (
                                        approvedProducts.map((product) => (
                                            <div className={styles.adminProductCard} key={product._id}>
                                                <div className={styles.adminProductImageContainer}>
                                                    <img
                                                        src={product.profilePic || (product.images && product.images.length > 0 ? product.images[0] : pfp2)}
                                                        alt="Product Image"
                                                        className={styles.adminProductImage}
                                                    />
                                                </div>
                                                <div className={styles.adminProductDetails}>
                                                    <h4 className={styles.adminProductName}>{product.productName}</h4>
                                                    <p className={styles.adminProductDescription}>
                                                        <strong>Description:</strong> {product.description}
                                                    </p>
                                                    <div className={styles.adminProductTags}>
                                                        <strong>Tags:</strong>
                                                        {product.tags && product.tags.length > 0 ? (
                                                            <div className={styles.adminTagsList}>
                                                                {product.tags.map((tag, index) => (
                                                                    <span key={index} className={styles.adminTag}>{tag}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className={styles.adminNoTags}>No tags available</span>
                                                        )}
                                                    </div>
                                                    <div className={styles.adminProductTeam}>
                                                        <strong>Team Members:</strong>
                                                        {product.team && product.team.length > 0 ? (
                                                            <div className={styles.adminTeamList}>
                                                                {product.team.map((member, index) => (
                                                                    <span key={index} className={styles.adminTeamMember}>{member.name}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className={styles.adminNoTeam}>No team members</span>
                                                        )}
                                                    </div>
                                                    <p className={styles.adminProductEmail}>
                                                        <strong>Email:</strong> {product.email}
                                                    </p>
                                                    <p className={styles.adminApprovedDate}>
                                                        <strong>Approved On:</strong> {new Date(product.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.adminEmptyState}>
                                            <div className={styles.adminEmptyIcon}>✅</div>
                                            <p className={styles.adminEmptyText}>No approved products</p>
                                            <p className={styles.adminEmptySubtext}>Approved products will appear here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedTab === "pendingUsers" && (
                            <div className={styles.adminTabContent}>
                                <h3 className={styles.adminTabTitle}>Pending Users</h3>
                                <div className={styles.adminUsersGrid}>
                                    {pendingUsers.length > 0 ? (
                                        pendingUsers.map(user => (
                                            <div className={styles.adminUserCard} key={user.email}>
                                                <div className={styles.adminUserInfo}>
                                                    <div className={styles.adminUserAvatar}>
                                                        <span className={styles.adminAvatarText}>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                                                    </div>
                                                    <div className={styles.adminUserDetails}>
                                                        <h4 className={styles.adminUserName}>{user.name || 'Unknown User'}</h4>
                                                        <p className={styles.adminUserEmail}>{user.email}</p>
                                                        <p className={styles.adminUserType}>
                                                            <strong>Type:</strong> {user.type || 'User'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={styles.adminUserActions}>
                                                    <a
                                                        href={`http://localhost:3001/${user.pdfFile}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.adminViewPdfBtn}
                                                    >
                                                        📄 View PDF
                                                    </a>
                                                    <div className={styles.adminActionButtons}>
                                                        <button
                                                            className={styles.adminApproveBtn}
                                                            onClick={() => handleApproveUser(user.email)}
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                        <button
                                                            className={styles.rejectBtn}
                                                            onClick={() => {
                                                                setCurrentRejectUserEmail(user.email);
                                                                setRejectionReason("");
                                                                setShowRejectUserModal(true);
                                                            }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.adminEmptyState}>
                                            <div className={styles.adminEmptyIcon}>👥</div>
                                            <p className={styles.adminEmptyText}>No pending users</p>
                                            <p className={styles.adminEmptySubtext}>All user applications have been reviewed</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedTab === "approvedUsers" && (
                            <div className={styles.adminTabContent}>
                                <h3 className={styles.adminTabTitle}>Approved Users</h3>
                                <div className={styles.adminUsersGrid}>
                                    {approvedUsers.length > 0 ? (
                                        approvedUsers.map(user => (
                                            <div className={styles.adminUserCard} key={user.email}>
                                                <div className={styles.adminUserInfo}>
                                                    <div className={styles.adminUserAvatar}>
                                                        <span className={styles.adminAvatarText}>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                                                    </div>
                                                    <div className={styles.adminUserDetails}>
                                                        <h4 className={styles.adminUserName}>{user.name || 'Unknown User'}</h4>
                                                        <p className={styles.adminUserEmail}>{user.email}</p>
                                                        <p className={styles.adminUserType}>
                                                            <strong>Type:</strong> {user.type || 'User'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={styles.adminApprovedBadge}>
                                                    ✓ Approved
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.adminEmptyState}>
                                            <div className={styles.adminEmptyIcon}>✅</div>
                                            <p className={styles.adminEmptyText}>No approved users</p>
                                            <p className={styles.adminEmptySubtext}>Approved users will appear here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {showRejectModal && (
                            <div className={styles.modalOverlay}>
                                <div className={styles.modalContent}>
                                    <h3>Select rejection reasons (optional):</h3>

                                    {rejectionOptions.map((reason, idx) => (
                                        <label key={idx} style={{ display: "block", margin: "5px 0" }}>
                                            <input
                                                type="checkbox"
                                                checked={rejectReasons.includes(reason)}
                                                onChange={() => {
                                                    setRejectReasons(prev =>
                                                        prev.includes(reason)
                                                            ? prev.filter(r => r !== reason)
                                                            : [...prev, reason]
                                                    );
                                                }}
                                            />
                                            {" "}{reason}
                                        </label>
                                    ))}

                                    <div style={{ marginTop: "20px" }}>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await axios.post(`http://localhost:3001/admin/reject-product/${currentRejectProductId}`, {
                                                        reasons: rejectReasons,
                                                    });

                                                    if (res.data.status === "Success") {
                                                        setPendingProducts(prev =>
                                                            prev.filter(p => p._id !== currentRejectProductId)
                                                        );
                                                        setShowRejectModal(false);
                                                        setShowRejectSuccessModal(true);

                                                    }
                                                } catch (err) {
                                                    alert("Rejection failed.");
                                                    console.error(err);
                                                }
                                            }}
                                            className={styles.rejectBtn}
                                        >
                                            Confirm Reject
                                        </button>
                                        <button
                                            onClick={() => setShowRejectModal(false)}
                                            className={styles.cancelBtn}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {showRejectSuccessModal && (
                            <div className={styles.modalOverlay}>
                                <div className={styles.modalContent}>
                                    <h3>✅ Product has been rejected successfully!</h3>
                                    <p>An email has been sent to the user with the reasons.</p>
                                    <button
                                        onClick={() => setShowRejectSuccessModal(false)}
                                        className={styles.okBtn}
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        )}

                        {showRejectUserModal && (
                            <div className={styles.modalOverlay}>
                                <div className={styles.modalContent}>
                                    <h3>Reason for rejecting this user:</h3>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows="5"
                                        cols="40"
                                        placeholder="Enter rejection reason here..."
                                        style={{ width: "100%", padding: "8px" }}
                                    />

                                    <div style={{ marginTop: "15px" }}>
                                        <button
                                            className={styles.rejectBtn}
                                            onClick={async () => {
                                                try {
                                                    const res = await axios.post(
                                                        `http://localhost:3001/admin/reject-user/${currentRejectUserEmail}`,
                                                        { reason: rejectionReason }
                                                    );

                                                    if (res.data.status === "Success") {
                                                        setPendingUsers(prev =>
                                                            prev.filter(user => user.email !== currentRejectUserEmail)
                                                        );
                                                        setShowRejectUserModal(false);
                                                        setAlertMessage("User rejected and email sent.");
                                                        setShowAlert(true);
                                                    }
                                                } catch (err) {
                                                    alert("Failed to reject user.");
                                                    console.error(err);
                                                }
                                            }}
                                        >
                                            Confirm Reject
                                        </button>
                                        <button
                                            className={styles.cancelBtn}
                                            onClick={() => setShowRejectUserModal(false)}
                                            style={{ marginLeft: "10px" }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }



    return (
        <div className={styles.profileContainer} >
            {/* Left Panel */}
            <div className={styles.leftPanel}>
                <h2>Profile Picture</h2>


                {profilePic ? (
                    <img src={profilePic} alt="Profile" className={styles.aboutImage} />
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


                {/* account address part */}
                <div className={styles.accountInfoSection}>
                    <h3>Account Address:</h3>
                    <div className={styles.accountData}>
                        {accountInfo.accountAddress || 'Not available'}
                    </div>


                    <h3>Private Key:</h3>
                    <div className={styles.accountData}>
                        {accountInfo.privateKey || 'Not available'}
                    </div>
                </div>
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
            {showAlert && (
                <div className={styles.alertPopup}>
                    <p>{alertMessage}</p>
                    <button onClick={() => setShowAlert(false)} className={styles.closeAlert}>OK</button>
                </div>
            )}

        </div>

    );
}


export default Profile;
