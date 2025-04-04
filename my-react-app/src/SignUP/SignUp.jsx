import React, { useState } from "react";
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password || !type || !pdfFile) {
            alert("Please fill all fields and upload a PDF.");
            return;
        }
        if (password !== finalPassword) {
            alert("Passwords do not match.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("signupType", type);  // This field must match the backend
        formData.append("pdfFile", pdfFile);

        try {
            const response = await axios.post("http://localhost:3001/register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200) {
                alert("Your signup request has been submitted for verification.");
                navigate("/login");
            } else {
                alert("Signup failed. Try again.");
            }
        } catch (error) {
            console.error("Error during signup:", error);
            alert("Signup failed. Please try again.");
        }
    };
    
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.text}>Sign Up</div>
                <div className={styles.underline}></div>
            </div>
            
            <div className={styles.inputs}>
                <div className={styles.input}>
                    <img src={Login_icon} className={styles.icon} alt="" />
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className={styles.input}>
                    <img className={styles.icon} src={Email_icon} alt="" />
                    <input type="email" placeholder="Email ID" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className={styles.input}>
                    <img src={Password_icon} className={styles.icon} alt="" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className={styles.input}>
                    <img src={Password_icon} className={styles.icon} alt="" />
                    <input type="password" placeholder="Confirm Password" value={finalPassword} onChange={(e) => setFinalPassword(e.target.value)} />
                </div>
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

            <div className={styles.submit_container}>
                <div className={styles.submit} onClick={handleSubmit}>
                    Sign Up
                </div>
            </div>
        </div>
    );
}

export default SignUp;
