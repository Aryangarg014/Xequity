import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./Company.module.css";
import pfp from "/assests/propfp.jpg"; // Unused, consider removing

function Company() {
  const { email } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInEmail = location.state?.loggedInEmail || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (email) {
      axios
        .get(`http://localhost:3001/products/${email}`)
        .then((res) => {
          if (res.data.status === "Success") {
            setProducts(res.data.products);
          } else {
            setError("Failed to load products.");
          }
        })
        .catch((err) => {
          setError("Error fetching products. Try again later.");
          console.error("Fetch Error:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [email]);

  const handleAddProduct = () => {
    navigate(`/add-product/${email}`);
  };

  const handleViewProduct = (email) => {
    navigate(`/ProductPage/${email}`, { state: { loggedInEmail } });
  };

  const handleUpdateProduct = (email) => {
    navigate(`/update-product/${email}`);
  };


  return (
    <div className={styles.container}>
      <div className={styles.rightPanel}>
        <h2>My Products</h2>

        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : products.length === 0 ? (
          <>
            <p>No products added yet.</p>
            <button className={styles.addButton} onClick={handleAddProduct}>
              + Add New Product
            </button>
          </>
        ) : (
          <div className={styles.productList}>
            {products.map((product) => (
              <div key={product._id} className={styles.productCard}>
                <img
                  src={product.profilePic || product.images[0]}


                  alt={product.productName}
                  className={styles.productImage}
                />
                <h3>{product.productName}</h3>
                <p>{product.description}</p>
                <p>
                  <strong>Tags:</strong> {product.tags.join(", ")}
                </p>
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.viewButton}
                    onClick={() => handleViewProduct(product.email)}
                  >
                    View
                  </button>
                  <button
                    className={styles.updateButton}
                    onClick={() => handleUpdateProduct(product.email)}
                  >
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Company;

