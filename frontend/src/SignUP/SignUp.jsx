import React, { useState, useEffect } from "react";
import styles from "./SignUp.module.css";
import Login_icon from "../assets/Investor.png";
import Email_icon from "../assets/emailIcon.png";
import Password_icon from "../assets/password_icon.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SignUp() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [finalPassword, setFinalPassword] = useState("");
    const [type, setType] = useState(""); // 'Investor' or 'Startup'
    const [pdfFile, setPdfFile] = useState(null);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [otp, setOtp] = useState("");
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [verificationError, setVerificationError] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState(""); // For success alert

    // New state for the registration status popup
    const [regPopup, setRegPopup] = useState({
        show: false,
        type: '', // 'loading', 'success', 'error'
        message: ''
    });

    useEffect(() => {
        // Clear verification status on page load/refresh
        sessionStorage.removeItem('verifiedEmail');
        setIsEmailVerified(false);
        setShowOtpInput(false);
        setOtp('');
    }, []);

    const handleCheckboxChange = (selectedType) => {
        setType(selectedType);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
        } else {
            alert("Please upload a valid PDF file.");
            setPdfFile(null);
        }
    };

    const handleSendOTP = async () => {
        if (!email) {
            setErrorMessage("Please enter email first");
            return;
        }

        try {
            setErrorMessage("");
            setLoading(true); // ⏳ Start loading

            const purpose = "signup";
            const response = await axios.post("http://localhost:3001/send-otp", { email, purpose });

            if (response.data.status === "Success") {
                setShowOtpInput(true);
                setPopupMessage("OTP sent successfully"); // ✅ Show success popup
                setTimeout(() => setPopupMessage(""), 3000);
            }
        } catch (error) {
            const message = error.response?.data?.message || "Failed to send OTP";
            setErrorMessage(message);

            if (error.response?.data?.message.includes("already registered")) {
                setEmail("");
            }
        } finally {
            setLoading(false); // ⏹ Stop loading
        }
    };


    const handleVerifyOTP = async () => {
        try {
            setLoading(true);
            const response = await axios.post("http://localhost:3001/verify-otp", {
                email,
                otp
            });

            if (response.data.status === "Success") {
                setIsEmailVerified(true);
                setShowOtpInput(false);
                setVerificationError("");
                // Store verification in sessionStorage
                sessionStorage.setItem('verifiedEmail', email);
                setPopupMessage("OTP verified successfully ✅");
                setTimeout(() => setPopupMessage(""), 3000);
                setShowAuthModal(true);
            }
        } catch (error) {
            setVerificationError(error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Client-side validation ---
        const verifiedEmail = sessionStorage.getItem('verifiedEmail');
        if (verifiedEmail !== email) {
            setErrorMessage("Please verify your email first!");
            return;
        }
        if (!name.trim()) {
            setErrorMessage("Please enter your name");
            return;
        }
        if (!email.trim()) {
            setErrorMessage("Please enter your email");
            return;
        }
        if (!password) {
            setErrorMessage("Please enter a password");
            return;
        }
        if (password !== finalPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }
        if (!type) {
            setErrorMessage("Please select whether you are an Investor or Company");
            return;
        }
        if (!pdfFile) {
            setErrorMessage("Please upload a PDF file");
            return;
        }
        setErrorMessage(""); // Clear errors if all validations pass

        // --- Show loading popup and make API call ---
        setRegPopup({ show: true, type: 'loading', message: 'Please wait...' });

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("email", email.trim());
        formData.append("password", password);
        formData.append("signupType", type);
        formData.append("pdfFile", pdfFile);

        try {
            const response = await axios.post(
                "http://localhost:3001/register",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.status === 200) {
                // On success, show success popup
                setRegPopup({
                    show: true,
                    type: 'success',
                    message: 'Your profile has been registered successfully and is in review.'
                });
            }
        } catch (error) {
            // On failure, show error popup
            const message = error.response?.data?.message || "An unexpected error occurred. Please try again.";
            setRegPopup({ show: true, type: 'error', message: message });
        }
    };

    const handlePopupConfirm = () => {
        if (regPopup.type === 'success') {
            setRegPopup({ show: false, type: '', message: '' });
            navigate("/login");
        } else {
            // For 'error' or other types, just close the popup
            setRegPopup({ show: false, type: '', message: '' });
        }
    };


    useEffect(() => {
        return () => {
            sessionStorage.removeItem('verifiedEmail');
        };
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.text}>Sign Up</div>
                <div className={styles.underline}></div>
            </div>

            <div className={styles.inputs}>
                {!isEmailVerified ? (
                    <div className={styles.verificationRequired}>
                        <div className={styles.input}>
                            <img src={Email_icon} alt="" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrorMessage(""); // Clear error when user types
                                }}
                                className={styles.otpInput}
                                disabled={isEmailVerified}
                            />
                            {!isEmailVerified && (
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    className={styles.otpButton}
                                    disabled={showOtpInput || loading}
                                >
                                    {showOtpInput ? 'Sent' : 'Send OTP'}
                                </button>
                            )}
                        </div>
                        {errorMessage && (
                            <p className={styles.errorMessage}>{errorMessage}</p>
                        )}
                        {showOtpInput && (
                            <div className={styles.input}>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className={styles.otpInput}
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyOTP}
                                    className={styles.otpButton}
                                    disabled={loading}
                                >
                                    Verify Email
                                </button>
                            </div>
                        )}
                         {verificationError && <p className={styles.errorMessage}>{verificationError}</p>}
                    </div>
                ) : (
                    <div className={styles.signupForm}>
                        <div className={styles.input}>
                            <img src={Login_icon} className={styles.icon} alt="" />
                            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className={styles.input}>
                            <img src={Password_icon} className={styles.icon} alt="" />
                            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className={styles.input}>
                            <img src={Password_icon} className={styles.icon} alt="" />
                            <input type="password" placeholder="Confirm Password" value={finalPassword} onChange={(e) => setFinalPassword(e.target.value)} />
                        </div>

                        {/* Checkbox for selecting either Investor or Startup */}
                        <div className={styles.checkboxContainer}>
                            <label className={styles.check}>
                                <input type="checkbox" checked={type === "investor"} onChange={() => handleCheckboxChange("investor")} />
                                Investor
                            </label>

                            <label className={styles.check}>
                                <input type="checkbox" checked={type === "company"} onChange={() => handleCheckboxChange("company")} />
                                Company
                            </label>
                        </div>

                        {/* PDF Upload */}
                        <div className={styles.fileUpload}>
                            <label>Upload Authorization PDF:</label>
                            <input type="file" accept="application/pdf" onChange={handleFileChange} />
                        </div>
                    </div>
                )}
            </div>

            {errorMessage && isEmailVerified && (
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{errorMessage}</p>
                </div>
            )}

            <div className={styles.submit_container}>
                 {isEmailVerified && (
                    <div className={styles.submit} onClick={handleSubmit}>
                        Sign Up
                    </div>
                )}
            </div>
            <div className={styles.redirectText}>
                Already have an account?&nbsp;
                <span
                    className={styles.redirectLink}
                    onClick={() => navigate('/login')}
                >
                    Login
                </span>
            </div>
            {showAuthModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <h2>Authorization Form Required</h2>
                        <p>
                            Before proceeding with registration, all Investors and Companies are required to fill out the Authorization Form.
                            You must upload the completed form during registration. The forms will be verified by the admin.
                        </p>
                        <ul>
                            <li>
                                <a href="/Investor_Authorization.pdf" download="Investor_Authorization_Form.pdf">
                                    Download Investor Authorization Form
                                </a>
                            </li>
                            <li>
                                <a href="/Company_Authorization.pdf" download="Company_Authorization_Form.pdf">
                                    Download Company Authorization Form
                                </a>
                            </li>
                        </ul>
                        <button onClick={() => setShowAuthModal(false)} className={styles.submit}>
                            I Understand
                        </button>
                    </div>
                </div>
            )}
            
            {/* Loading overlay for OTP */}
            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingSpinner}></div>
                    <div className={styles.loadingText}>
                        {showOtpInput ? "Verifying OTP..." : "Sending OTP..."}
                    </div>
                </div>
            )}

            {/* Popup message for temporary alerts */}
            {popupMessage && (
                <div className={styles.popupMessage}>
                    {popupMessage}
                    <button onClick={() => setPopupMessage("")}>×</button>
                </div>
            )}
            
            {/* New Centered Popup for Registration Status */}
            {regPopup.show && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        {regPopup.type === 'loading' && (
                            <>
                                <h2>Registering...</h2>
                                <p>{regPopup.message}</p>
                                <div className={styles.loadingSpinner}></div>
                            </>
                        )}
                        {regPopup.type === 'success' && (
                            <>
                                <h2>Success!</h2>
                                <p>{regPopup.message}</p>
                                <button onClick={handlePopupConfirm} className={styles.submit}>
                                    I Understand
                                </button>
                            </>
                        )}
                        {regPopup.type === 'error' && (
                            <>
                                <h2>Error</h2>
                                <p>{regPopup.message}</p>
                                <button onClick={handlePopupConfirm} className={styles.submit}>
                                    Close
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

        </div>

    );
}

export default SignUp;