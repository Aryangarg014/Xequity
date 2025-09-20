import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa"; // Add this import
import myImage from './assets/Product.gif';
import pfp from '../assests/propfp.jpg';
import pfp2 from '../assests/propfp2.jpg';
// import styles from "./Product.module.css";
import TrendingProducts from "./TrendingProducts";
import styles from "./ProductsByTag.module.css";



// Add useremail prop to the component
function ProductsByTag({ useremail }) {
    const { tag } = useParams();
    const [products, setProducts] = useState([]);
    const [upvotedMap, setUpvotedMap] = useState({}); // Add this state

    useEffect(() => {
        const fetchProductsByTag = async () => {
            try {
                const response = await fetch(`http://localhost:3001/products-by-tag/${tag}`);
                const data = await response.json();
                if (data.status === "Success") {
                    setProducts(data.products);

                    // Fetch upvote status for each product
                    const statuses = await Promise.all(
                        data.products.map(product =>
                            fetch(`http://localhost:3001/user/${useremail}/${product.email}`).then(res => res.json())
                        )
                    );

                    const statusMap = {};
                    data.products.forEach((product, idx) => {
                        statusMap[product.email] = statuses[idx].upvoted;
                    });
                    setUpvotedMap(statusMap);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };

        fetchProductsByTag();
    }, [tag, useremail]);

    // Add handleUpvote function
    const handleUpvote = async (productEmail) => {
        try {
            const response = await fetch(`http://localhost:3001/upvote/${useremail}/${productEmail}`);
            const data = await response.json();
            if (data.status === "Success") {
                setUpvotedMap(prev => ({ ...prev, [productEmail]: data.upvoted }));
                setProducts(prev => prev.map(p =>
                    p.email === productEmail ? { ...p, upvote: data.upvotes } : p
                ));
            }
        } catch (error) {
            console.error("Upvote error:", error);
        }
    };

    return (
        <div className={styles.Body}>
            <div>
                <h2 className={styles.filterTagMessage}>Products tagged with : "{tag}"</h2>
                <section className={styles.container}>
                    {products.length > 0 ? (
                        products.map((product, index) => (
                            <div className={styles.contentWrapper} key={product.email}>
                                <Link to={`/ProductPage/${product.email}`} className={styles.detailsLink}>
                                    <div className={styles.content}>
                                        <div className={styles.logo}>
                                            <img
                                                src={
                                                    product.profilePic
                                                        ? product.profilePic
                                                        : product.images?.[0]
                                                            ? product.images[0]
                                                            : (index % 2 === 0 ? pfp2 : pfp)
                                                }
                                                alt="Product"
                                                className={styles.aboutImage}
                                            />
                                        </div>

                                        <div className={styles.specification}>
                                            <ul className={styles.aboutItems}>
                                                <li className={styles.aboutItem}>
                                                    <div className={styles.aboutItemText}>
                                                        <h2>{product.productName}</h2>
                                                        <p>{product.description}</p>

                                                        {/* clickable tags */}
                                                        <div className={styles.tagContainer}>
                                                            <strong style={{ marginRight: "6px", color: "#333" }}>Tags:</strong>
                                                            {product.tags && product.tags.length > 0
                                                                ? product.tags.map((tag, i) => (
                                                                    <Link
                                                                        to={`/products-by-tag/${tag}`}
                                                                        key={i}
                                                                        className={styles.tagLink}
                                                                    >
                                                                        <span className={styles.tag}>{tag}</span>
                                                                    </Link>
                                                                ))
                                                                : <span>No tags available</span>}
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* 🔴 Upvote inside card */}
                                        <div
                                            className={styles.upvoteBtn}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleUpvote(product.email);
                                            }}
                                        >
                                            <div className={styles.upvoteContainer}>
                                                <FaHeart
                                                    className={styles.heartIcon}
                                                    color={upvotedMap[product.email] ? "red" : "gray"}
                                                />
                                                <span className={styles.upvoteCount}>{product.upvote}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noResults}>
                            No products found for "<b>{tag}</b>"
                        </p>
                    )}
                </section>
            </div>
            <TrendingProducts />
        </div>
    );

}

export default ProductsByTag;