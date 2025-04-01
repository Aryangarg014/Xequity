import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Hero } from "./Prdcomponents/prdHero/Hero";
import axios from "axios";

const ProductPage = () => {
  const { email } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product details (optional)
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
    <div>
      {loading ? (
        <p>Loading product...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <Hero product={product} email={email} />
      )}
    </div>
  );
};

export default ProductPage;
