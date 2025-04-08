import React, { useState, useEffect } from "react";
import styles from "../Login/Login.module.css";
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

    useEffect(() => {
        // Clear verification status on page load/refresh
        sessionStorage.removeItem('verifiedEmail');
        setIsEmailVerified(false);
        setShowOtpInput(false);
        setOtp('');
    }, []);

    const handleCheckboxChange = (selectedType) => {
        {console.log(selectedType)}
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
            setErrorMessage(""); // Clear any existing errors
            const response = await axios.post("http://localhost:3001/send-otp", { email });
            if (response.data.status === "Success") {
                setShowOtpInput(true);
                alert("OTP sent to your email!");
            }
        } catch (error) {
            const message = error.response?.data?.message || "Failed to send OTP";
            setErrorMessage(message);
            
            if (error.response?.data?.message.includes("already registered")) {
                setEmail("");
            }
        }
    };

    const handleVerifyOTP = async () => {
        try {
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
                alert("Email verified successfully!");
            }
        } catch (error) {
            setVerificationError(error.response?.data?.message || "Invalid OTP");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check verification status from sessionStorage
        const verifiedEmail = sessionStorage.getItem('verifiedEmail');
        if (verifiedEmail !== email) {
            setErrorMessage("Please verify your email first!");
            return;
        }

        try {
            // Client-side validation
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

            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("email", email.trim());
            formData.append("password", password);
            formData.append("signupType", type);
            formData.append("pdfFile", pdfFile);

            const response = await axios.post(
                "http://localhost:3001/register", 
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    validateStatus: function (status) {
                        return status < 500; // Handle only server errors automatically
                    }
                }
            );

            if (response.status === 200) {
                alert(response.data.message || "Signup successful! Please wait for admin verification.");
                navigate("/login");
            } else {
                setErrorMessage(response.data.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Error during signup:", error);
            if (error.response?.data?.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("An unexpected error occurred. Please try again later.");
            }
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
                                    disabled={showOtpInput}
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
                                >
                                    Verify Email
                                </button>
                            </div>
                        )}
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
                            <label>Upload PDF:</label>
                            <input type="file" accept="application/pdf" onChange={handleFileChange} />
                        </div>
                    </div>
                )}
            </div>

            {errorMessage && (
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{errorMessage}</p>
                </div>
            )}

            <div className={styles.submit_container}>
                <div className={styles.submit} onClick={handleSubmit}>
                    Sign Up
                </div>
            </div>
        </div>
    );
}

export default SignUp;
