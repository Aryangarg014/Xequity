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
    const [type, settype] = useState(""); // 'investor' or 'product'

    const handleCheckboxChange = (selectedType) => {
        settype(selectedType);
        console.log(type);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!name) {
            alert("Please enter your name");
            return;
        }
        if (!email) {
            alert("Please enter your email");
            return;
        }
        if (!password) {
            alert("Please enter a password");
            return;
        }
        if (password !== finalPassword) {
            alert("Passwords do not match");
            return;
        }
        if (!type) {
            alert("Please select Investor or Product");
            return;
        }

        axios.post("http://localhost:3001/register", { name, email, password, signupType: type })

            .then((result) => {
                console.log(result);
                navigate("/login");
            })
            .catch((err) => console.log(err));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.text}>Sign Up</div>
                <div className={styles.underline}></div>
            </div>
            
            <div className={styles.inputs}>
                <div className={styles.input}>
                    <img src={Login_icon} className={styles.icon} alt="" style={{ height: "25px", width: "auto" }} />
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className={styles.input}>
                    <img className={styles.icon} src={Email_icon} alt="" />
                    <input type="email" placeholder="Email ID" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className={styles.input}>
                    <img src={Password_icon} className={styles.icon} alt="" style={{ height: "25px", width: "auto" }} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className={styles.input}>
                    <img src={Password_icon} className={styles.icon} alt="" style={{ height: "25px", width: "auto" }} />
                    <input type="password" placeholder="Confirm Password" value={finalPassword} onChange={(e) => setFinalPassword(e.target.value)} />
                </div>
            </div>

            {/* Checkbox for selecting either Investor or Product */}
            <div className={styles.checkboxContainer}>
                <label className={styles.check}>
                    <input 
                        type="checkbox" 
                        checked={type === "investor"} 
                        onChange={() => handleCheckboxChange("investor")} 
                    />
                    Investor
                </label>

                <label className={styles.check}>
                    <input 
                        type="checkbox" 
                        checked={type === "product"} 
                        onChange={() => handleCheckboxChange("product")} 
                    />
                    Product
                </label>
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