import Profile from "./Profile/Profile";
import React, { useState,useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Headbar from "./Headbar";
import Product from "./Product";
import ProductPage from "./ProductPage";
import Login from "./Login/Login";
import Investor from "./Investor";
import InvestorPage from "./InvestorPage";
import SignUp from "./SignUP/SignUp";
import Footer from './Footer';
import Company from "./Company/Company";
import Insert from "./InsertProduct/Insert";
import Forum from "./Forum"; // Import Form.jsx
import InvestorsByTag from "./InvestorsByTag"; // Filter Investors by Tag
import ProductsByTag from "./ProductsByTag"; // Filter Products by Tag
import CreatePost from "./CreatePost";
import Update from "./Company/Update";
import MyInvestment from "./MyInvestment";
import VirtualAssets from "./VirtualAssets";
import BuyToken from "./BuyToken"; // Import BuyToken Component
import GainEquity from "./GainEquity";
import MyTokens from './MyTokens';
import TransactionHistory from "./TransactionHistory"; 

import TokenPage from "./TokenPage";

import Message from "./Message";
import MessagePage from "./MessagePage";

import ForgotPassword from './ForgotPassword'; // adjust path if needed

import { getAuthData, saveAuthData, clearAuthData } from './utils';
import KYCForm from './KYCForm'; // adjust path




function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
// Check for existing authentication on component mount
  useEffect(() => {
    const { isLoggedIn: storedIsLoggedIn, userData: storedUserData } = getAuthData();
    if (storedIsLoggedIn && storedUserData) {
      setIsLoggedIn(true);
      setUserData(storedUserData);
    }
    setIsLoading(false);
  }, []);


  // Update localStorage when authentication state changes
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUserData(userData);
    saveAuthData(userData);
  };


  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    clearAuthData();
  };


  // Show loading while checking authentication
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      Loading...
    </div>;
  }

  return (
    <Router>
      <Headbar
        isLoggedIn={isLoggedIn}
        userName={userData?.name || "Guest"}
        setUserName={(name) => setUserData((prev) => ({ ...prev, name }))}
        setIsLoggedIn={handleLogout}
        userData={userData}
      />
      <Routes>
        <Route path="/InvestorPage/:email" element={isLoggedIn && userData?.email ? <InvestorPage userEmail={userData.email} /> : <Navigate to="/login" />} />
        <Route path="/" element={isLoggedIn ? <Forum useremail={userData?.email} username={userData?.name} /> : <Navigate to="/register" />} />
        <Route path="/register" element={<SignUp />} />
        <Route
          path="/login"
          element={<Login setIsLoggedIn={handleLogin} setUserData={setUserData} />}
        />
        <Route path="/CreatePost" element={isLoggedIn ? <CreatePost useremail={userData?.email} username={userData?.name} /> : <Navigate to="/register" />} />
        <Route path="/investor" element={isLoggedIn ? <Investor /> : <Navigate to="/login" />} />
        <Route path="/InvestorPage" element={isLoggedIn ? <InvestorPage /> : <Navigate to="/login" />} />
        <Route path="/product" element={isLoggedIn ? <Product useremail={userData?.email} /> : <Navigate to="/login" />} />
        <Route path="/ProductPage/:email" element={isLoggedIn ? <ProductPage userEmail={userData?.email} /> : <Navigate to="/login" />} />
        <Route path="/profile/:email" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
        <Route
          path="/company/:email"
          element={isLoggedIn && userData?.type === "company" ? <Company /> : <Navigate to="/login" />}
        />
        <Route
          path="/add-product/:email"
          element={isLoggedIn && userData?.type === "company" ? <Insert /> : <Navigate to="/login" />}
        />

        <Route path="/transaction-history/:email" element={<TransactionHistory />} />
        

        <Route path="/investors/tag/:tagName" element={<InvestorsByTag />} />
        <Route path="/products-by-tag/:tag" element={<ProductsByTag />} />
        <Route path="/update-product/:email" element={<Update />} />


        <Route path="/MyInvestment/:email" element={isLoggedIn ? <MyInvestment useremail={userData?.email} /> : <Navigate to="/login" />} />


        {/* 👇 Updated: Pass userData.email to VirtualAssets */}
        <Route
          path="/VirtualAssets"
          element={isLoggedIn ? <VirtualAssets userEmail={userData?.email} /> : <Navigate to="/login" />}
        />
        <Route path="/buy-token/:email" element={<BuyToken />} /> {/* Route with email parameter */}

        <Route path="/gain-equity/:email" element={isLoggedIn ? <GainEquity /> : <Navigate to="/login" />} />


        {/* 👇 Updated: TokenPage will receive logged-in user's email via navigation state (handled in VirtualAssets.jsx) */}
        <Route
          path="/TokenPage/:email"
          element={isLoggedIn ? <TokenPage /> : <Navigate to="/login" />}
        />

        <Route path="/connect" element={isLoggedIn && userData?.email ? <Message userEmail={userData.email} /> : <Navigate to="/login" />} />
        <Route path="/messagePage/:user1/:user2" element={isLoggedIn && userData?.email ? <MessagePage /> : <Navigate to="/login" />} />

        <Route path="/mytokens/:email" element={<MyTokens />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

      ///////////////////////////--------KYC--------------/////////////
       <Route path="/kyc/:email" element={<KYCForm />} />


      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
