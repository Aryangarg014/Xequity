import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Company.module.css"; // Ensure CSS file exists
import pfp from "/assests/propfp.jpg";

function Company() {
  const { email } = useParams(); // Get company email from URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch products
  useEffect(() => {
    if (email) {
      axios
        .get(`http://localhost:3001/products/${email}`) // Adjust API URL if necessary
        .then((response) => {
          if (response.data.status === "Success") {
            setProducts(response.data.products);
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

  // Navigate to add new product page
  const handleAddProduct = () => {
    navigate(`/add-product/${email}`);
  };

  // Navigate to view product details with email
  const handleViewProduct = ( productEmail) => {
    navigate(`/ProductPage/${productEmail}`);
  };

  // Navigate to update product
  const handleUpdateProduct = (product_email) => {
    navigate(`/update-product/${product_email}`);
  };

  // Delete product
  const handleDeleteProduct = (productId) => {
    axios
      .delete(`http://localhost:3001/delete-product/${productId}`)
      .then((response) => {
        if (response.data.status === "Success") {
          setProducts(products.filter((product) => product._id !== productId));
        } else {
          setError("Failed to delete product.");
        }
      })
      .catch((err) => {
        setError("Error deleting product. Try again later.");
        console.error("Delete Error:", err);
      });
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
                <img src={product.images[0]} alt={product.productName} className={styles.productImage} />
                <h3>{product.productName}</h3>
                <p>{product.description}</p>
                <p>
                  <strong>Tags:</strong> {product.tags.join(", ")}
                </p>
                <div className={styles.buttonGroup}>
                  <button className={styles.viewButton} onClick={() => handleViewProduct(product.email)}>
                    View
                  </button>
                  <button className={styles.updateButton} onClick={() => handleUpdateProduct(product.email)}>
                    Update
                  </button>
                  <button className={styles.deleteButton} onClick={() => handleDeleteProduct(product.email)}>
                    Delete
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
