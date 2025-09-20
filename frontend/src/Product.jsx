// import React, { useState, useEffect } from "react";
// import myImage from './assets/Product.gif';
// import pfp from '../assests/propfp.jpg';
// import pfp2 from '../assests/propfp2.jpg';
// import styles from "./Product.module.css";
// import Headbar from "./Headbar";
// import { Link, useLocation } from "react-router-dom";
// import TrendingProducts from "./TrendingProducts";
// function Product() {
//     const [products, setProducts] = useState([]);
//     const [fetchCount, setFetchCount] = useState(1);


//     const location = useLocation();
//     const searchParams = new URLSearchParams(location.search);
//     const query = searchParams.get("q") || "";


//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 const response = await fetch(`http://localhost:3001/products?q=${query}`);
//                 const data = await response.json();
//                 if (data.status === "Success") {
//                     setProducts(data.products);
//                 }
//             } catch (error) {
//                 console.error("Failed to fetch products:", error);
//             }
//         };


//         fetchProducts();
//     }, [query]); // Fetch products whenever the search query changes


//     let a = 1;


//     return (
//         <div className={styles.Body}>
//             <div>
//                 <section className={styles.container}>
//                     {/* Map over the fetched products */}
//                     {products.length > 0 ? (
//                         products.map((product, index) => (
//                             <Link to={`/ProductPage/${product.email}`} className={styles.detailsLink} key={product.email}>
//                                 <div className={styles.content}>
//                                     <div className={styles.logo}>
//                                         <img src={index % 2 === 0 ? pfp2 : pfp} alt="Product Image" className={styles.aboutImage} />
//                                     </div>
//                                     <div className={styles.specification}>
//                                         <ul className={styles.aboutItems}>
//                                             <li className={styles.aboutItem}>
//                                                 {/* Display product name and description */}
//                                                 <div className={styles.aboutItemText}>
//                                                     <h2>{product.productName}</h2>
//                                                     <p>{product.description}</p>
//                                                     <p><strong>Tags:</strong> {product.tags ? product.tags.join(', ') : 'No tags available'}</p>
//                                                 </div>
//                                             </li>
//                                         </ul>
//                                     </div>
//                                 </div>
//                             </Link>
//                         ))
//                     ) : (
//                         <p className={styles.noResults}>
//                             No products match your search "<b>{query}</b>"
//                         </p>
//                     )}
//                 </section>
//             </div>
//                   <TrendingProducts />
//         </div>
//     );


// }
// export default Product


import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import styles from "./Product.module.css";
import pfp from "../assests/propfp.jpg";
import pfp2 from "../assests/propfp2.jpg";
import TrendingProducts from "./TrendingProducts";


function Product({ useremail }) {
    const [products, setProducts] = useState([]);
    const [upvotedMap, setUpvotedMap] = useState({});
    const location = useLocation();
    const navigate = useNavigate();


    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("q") || "";


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://localhost:3001/products?q=${query}`);
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


        fetchProducts();
    }, [query, useremail]);


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
            <section className={styles.container}>
                {products.length > 0 ? (
                    products.map((product, index) => (
                        <div className={styles.contentWrapper} key={product.email}>
                            <Link to={`/ProductPage/${product.email}`} className={styles.detailsLink}>
                                <div className={styles.content}>
                                    <div className={styles.logo}>
                                        <img
                                            src={product.profilePic || (index % 2 === 0 ? pfp2 : pfp)}
                                            alt="Product"
                                            className={styles.aboutImage}
                                            onError={(e) => {
                                                e.target.src = index % 2 === 0 ? pfp2 : pfp;
                                            }}
                                        />
                                    </div>
                                    <div className={styles.specification}>
                                        <ul className={styles.aboutItems}>
                                            <li className={styles.aboutItem}>
                                                <div className={styles.aboutItemText}>
                                                    <h2>{product.productName}</h2>
                                                    <p>{product.description}</p>




                                                    {/* this clickable tag  */}
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




                                                    {/* till here */}


                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                to={`/upvote/${useremail}/${product.email}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleUpvote(product.email);
                                }}
                                className={styles.upvoteBtn}
                            >
                                <div className={styles.upvoteContainer}>
                                    <FaHeart
                                        className={styles.heartIcon}
                                        color={upvotedMap[product.email] ? "red" : "gray"}
                                    />
                                    <span className={styles.upvoteCount}>{product.upvote}</span>
                                </div>


                            </Link>
                        </div>
                    ))
                ) : (
                    <p className={styles.noResults}>
                        No products match your search "<b>{query}</b>"
                    </p>
                )}
            </section>
            <TrendingProducts />
        </div>
    );
}


export default Product;




