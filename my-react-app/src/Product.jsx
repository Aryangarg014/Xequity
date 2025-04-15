import React , {useState , useEffect} from "react";
import myImage from './assets/Product.gif'; 
import pfp from '../assests/propfp.jpg'; 
import pfp2 from '../assests/propfp2.jpg'; 
import styles from "./Product.module.css";
import Headbar from "./Headbar";
import { Link ,useLocation} from "react-router-dom"
function Product()
{
  const [products, setProducts] = useState([]);
  const [fetchCount, setFetchCount] = useState(1);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q") || "";

  useEffect(() => {
      const fetchProducts = async () => {
          try {
              const response = await fetch(`http://localhost:3001/products?q=${query}`);
              const data = await response.json();
              if (data.status === "Success") {
                  setProducts(data.products);
              }
          } catch (error) {
              console.error("Failed to fetch products:", error);
          }
      };

      fetchProducts();
  }, [query]); // Fetch products whenever the search query changes
  
  let a=1;

  return (
    <div className={styles.Body}>
        <div>
            <section className={styles.container}>
              {/* Map over the fetched products */}
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.email} className={styles.content}>
                            <Link to={`/ProductPage/${product.email}`} className={styles.detailsLink}>
                                <div className={styles.logo}>
                                    <img 
                                        src={product.images && product.images.length > 0 
                                            ? `http://localhost:3001${product.images[0]}` 
                                            : pfp2} 
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
                                                <p><strong>Tags:</strong> {product.tags.join(', ')}</p>
                                            </div>
                                        </li>
                                    </ul>
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
        </div>
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
                        mandrake - Send Automated Twitter DMs
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
export default Product