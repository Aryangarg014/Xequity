import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import myImage from './assets/Product.gif'; 
import pfp from '../assests/propfp.jpg'; 
import pfp2 from '../assests/propfp2.jpg'; 
import styles from "./Product.module.css";

function ProductsByTag() {
    const { tag } = useParams();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProductsByTag = async () => {
            try {
                const response = await fetch(`http://localhost:3001/products-by-tag/${tag}`);
                const data = await response.json();
                if (data.status === "Success") {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };

        fetchProductsByTag();
    }, [tag]); // Fetch products whenever the tag changes

    return (
        <div className={styles.Body}>
            <div>
                <h2 className={styles.filterTagMessage}>Products tagged with : "{tag}"</h2>
                <section className={styles.container}>
                    {/* Map over the fetched products */}
                    {products.length > 0 ? (
                        products.map((product, index) => (
                            <Link to={`/ProductPage/${product.email}`} className={styles.detailsLink} key={product.email}>
                                <div className={styles.content}>
                                    <div className={styles.logo}>
                                        <img src={index % 2 === 0 ? pfp2 : pfp} alt="Product" className={styles.aboutImage} />
                                    </div>
                                    <div className={styles.specification}>
                                        <ul className={styles.aboutItems}>
                                            <li className={styles.aboutItem}>
                                                <div className={styles.aboutItemText}>
                                                    <h2>{product.productName}</h2>
                                                    <p>{product.description}</p>
                                                    <p><strong>Tags:</strong> {product.tags ? product.tags.join(', ') : 'No tags available'}</p>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className={styles.noResults}>
                            No products found for "<b>{tag}</b>"
                        </p>
                    )}
                </section>
            </div>

            {/* Trending Products Section */}
            <div className={styles.profile}>
                <h3>Trending Products</h3>
                <ul className={styles.aboutItems}>
                    <li className={styles.aboutItem1}>
                        <div className={styles.aboutItemText}>
                            EpicTopia AI - personal pursuit manager to plan
                        </div>
                    </li>
                    <li className={styles.aboutItem1}>
                        <div className={styles.aboutItemText}>
                            Jasper - Create SEO-optimized content in minutes with AI
                        </div>
                    </li>
                    <li className={styles.aboutItem1}>
                        <div className={styles.aboutItemText}>
                            Mandrake - Send Automated Twitter DMs
                        </div>
                    </li>
                    <li className={styles.aboutItem1}>
                        <div className={styles.aboutItemText}>
                            Boardy - Get warm intros to investors, customers, and collaborators
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default ProductsByTag;