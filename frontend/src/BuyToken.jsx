import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ethers } from 'ethers';
import axios from "axios";
import "./BuyToken.css";
import { useParams } from "react-router-dom";
const BuyToken = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [userAddress, setUserAddress] = useState('');
    // Fetch user's account address when component mounts
    useEffect(() => {
      const fetchUserAddress = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/usertoken/${email}`);
          setUserAddress(response.data.accountAddress);
        } catch (error) {
          console.error("Error fetching user address:", error);
        }
      };
      fetchUserAddress();
    }, [email]);
  const [formData, setFormData] = useState({
    TokenName: "",
    NumberOfIssue: "",
    EquityDiluted: "",
    image: null,
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First initiate the blockchain transaction
      const transactionResponse = await axios.post("http://localhost:3001/api/transfer-tokens", {
        email,
        numberOfTokens: formData.NumberOfIssue,
        recipientAddress: userAddress
      });

      if (!transactionResponse.data.success) {
        throw new Error("Transaction failed");
      }

    const data = new FormData();
    data.append("email", email);
    data.append("TokenName", formData.TokenName);
    data.append("NumberOfIssue", Number(formData.NumberOfIssue)); // Convert to number
    data.append("EquityDiluted", Number(formData.EquityDiluted)); // Convert to number
    data.append("image", formData.image);
    data.append("transactionHash", transactionResponse.data.transactionHash);

      await axios.post("http://localhost:3001/api/virtualtokens", data);
      alert("Token purchase recorded successfully!");
      navigate("/"); // Redirect to home or another page
    } catch (error) {
      console.error("Error saving token data", error);
      alert("Failed to save token data");
    }
  };
  return (
    <div className="buy-token-container">
      <h2>Buy Token</h2>
      <form onSubmit={handleSubmit}>
        <label>Token Name:</label>
        <input type="text" name="TokenName" value={formData.TokenName} onChange={handleChange} required />

        <label>Number of Tokens:</label>
        <input type="number" name="NumberOfIssue" value={formData.NumberOfIssue} onChange={handleChange} required />

        <label>Equity Diluted:</label>
        <input type="number" name="EquityDiluted" value={formData.EquityDiluted} onChange={handleChange} required />

        <label>Upload Image:</label>
        <input type="file" name="image" onChange={handleFileChange} required />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
export default BuyToken;


