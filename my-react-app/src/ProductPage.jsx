import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Hero } from "./Prdcomponents/prdHero/Hero";
import axios from "axios";
import "./ProductPage.module.css";

const ProductPage = () => {
  const { email } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const loggedInEmail = location.state?.loggedInEmail || "";

  // Fetch product details
  useEffect(() => {
    axios
      .get(`http://localhost:3001/product/${email}`)
      .then((response) => {
        if (response.data.status === "Success") {
          setProduct(response.data.product);
        } else {
          setError("Failed to load product details.");
        }
      })
      .catch((err) => {
        setError("Error fetching product. Try again later.");
        console.error("Fetch Error:", err);
      })
      .finally(() => setLoading(false));
  }, [email]);

  return (
    <div className="product-page">
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading product...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : (
        <Hero 
          product={Array.isArray(product) ? product : [product]} 
          email={email} 
          loggedInEmail={loggedInEmail} 
        />
      )}
    </div>
  );
};

export default ProductPage;
