// KYCForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './KYCForm.css';

const KYCForm = () => {
  const { email } = useParams();
  const [isUpdate, setIsUpdate] = useState(false);
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    accountType: 'Current',
    aadhaarNumber: '',
    panNumber: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchKYC = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/payment-kyc/${email}`);
        setFormData(res.data);
        setIsUpdate(true); // Mark as update mode
      } catch (err) {
        setIsUpdate(false); // No KYC found, new submission
      }
    };
    fetchKYC();
  }, [email]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/payment-kyc', {
        email,
        ...formData
      });
      setMessage(res.data.message || 'KYC saved successfully');
      setIsUpdate(true); // After submission, it's now in update mode
    } catch (err) {
      console.error(err);
      setMessage('Error saving KYC info');
    }
  };


  return (
    <div className="kyc-container">
      <h2>KYC Information</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="kyc-form">
        <input type="text" name="accountHolderName" placeholder="Account Holder Name" value={formData.accountHolderName} onChange={handleChange} required />
        <input type="text" name="accountNumber" placeholder="Account Number" value={formData.accountNumber} onChange={handleChange} required />
        <input type="text" name="ifsc" placeholder="IFSC Code" value={formData.ifsc} onChange={handleChange} required />
        <select name="accountType" value={formData.accountType} onChange={handleChange} required>
          <option value="Current">Current</option>
          <option value="Savings">Savings</option>
        </select>
        <input type="text" name="aadhaarNumber" placeholder="Aadhaar Number" value={formData.aadhaarNumber} onChange={handleChange} required maxLength={12} />
        <input type="text" name="panNumber" placeholder="PAN Number" value={formData.panNumber} onChange={handleChange} required maxLength={10} />
        <button type="submit">{isUpdate ? "Update" : "Submit"}</button>
      </form>
    </div>
  );
};

export default KYCForm;
