import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import myImage from './assets/propfp.jpg';
import styles from "./TrendingProducts.module.css";

function TrendingProducts({ products }) {
  const [trendingProducts, setTrendingProducts] = useState([]);
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("http://localhost:3001/top-products");
        const data = await res.json();
        if (data.status === "Success") {
          setTrendingProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to fetch trending products:", err);
      }
    };

    fetchTrending();
    const interval = setInterval(fetchTrending, 5000);
    return () => clearInterval(interval);
  }, []);


  return (
    <aside className={styles.profile}>
      <h3>Trending Products</h3>
      <ul className={styles.aboutItems}>
        {trendingProducts.map((product) => (
          <li key={product.email}>
            <Link to={`/ProductPage/${product.email}`} className={styles.detailsLink}>
              <div className={styles.trendingItem}>
                <img
                  src={product.profilePic || myImage}

                  alt="Trending Product"
                  className={styles.trendingImage}
                />
                <div>
                  <h4>{product.productName}</h4>
                  <p>Upvotes: {product.upvote || 0}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default TrendingProducts;
