import React, { useState } from 'react';
import axios from 'axios';
import styles from './Login/Login.module.css'; // Reuse styles
import { useNavigate } from 'react-router-dom';


function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1 = enter email, 2 = verify OTP, 3 = reset password
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');


    const sendOtp = async () => {
        try {
            const res = await axios.post("http://localhost:3001/send-otp", { email , purpose : "forgot-password" });
            if (res.data.status === "Success") {
                alert("OTP sent to your email!");
                setStep(2);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error sending OTP");
        }
    };


    const verifyOtp = async () => {
        try {
            const res = await axios.post("http://localhost:3001/verify-otp", { email, otp });
            if (res.data.status === "Success") {
                alert("OTP Verified. Enter new password.");
                setStep(3);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "OTP verification failed");
        }
    };


    const resetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }


        try {
            const res = await axios.post("http://localhost:3001/reset-password", {
                email,
                otp,
                newPassword
            });


            if (res.data.status === "Success") {
                alert("Password reset successful. Please log in.");
                navigate("/login");
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Password reset failed");
        }
    };


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.text}>Forgot Password</div>
                <div className={styles.underline}></div>
            </div>


            <div className={styles.inputs}>
                {step === 1 && (
                    <>
                        <div className={styles.input}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className={styles.submit} onClick={sendOtp}>Send OTP</div>
                    </>
                )}


                {step === 2 && (
                    <>
                        <div className={styles.input}>
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <div className={styles.submit} onClick={verifyOtp}>Verify OTP</div>
                    </>
                )}


                {step === 3 && (
                    <>
                        <div className={styles.input}>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className={styles.input}>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div className={styles.submit} onClick={resetPassword}>Reset Password</div>
                    </>
                )}
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
}


export default ForgotPassword;




