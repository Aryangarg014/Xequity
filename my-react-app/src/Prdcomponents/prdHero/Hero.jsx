import React from "react";
import styles from "./Hero.module.css";
import pfp from "../../../assests/propfp.jpg";
import imagem from "../../../assests/product_image1.avif";
import imagem2 from "../../../assests/product_image2.jpeg";
import imagem3 from "../../../assests/product_image3.jpeg";
import { Link } from "react-router-dom"; // Ensure React Router is imported

export const Hero = ({ product, email }) => {
  const sliderImages = [imagem, imagem2, imagem3];
  
  return (
    <div className={styles.all}>
      <section className={styles.container}>
        <div className={styles.leftside}>
          <img src={product[0].images} alt="Product" className={styles.heroImg} />
        </div>

        <div className={styles.content}>
         {console.log(product)}

         {product.map((item, index) => (
            <div key={index}> {/* Wrap JSX inside .map() */}
              <h1 className={styles.title}>{item?.productName || "Product Name"}</h1>
              <p className={styles.description}>{item?.description || "Product description not available."}</p>
              <p className={styles.email}>Contact: {email}</p>
              <div className={styles.investor_type}>
                <div className={styles.investor_list}>
                  {item?.tags?.map((tag, i) => (
                    <Link key={i} to={`/products-by-tag/${tag}`} >
                      <button className={styles.tag}>{tag}</button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
        </div>
      </section>

      <div className={styles.imageSlider}>
        {sliderImages.map((image, index) => (
          <img key={index} src={image} alt={`Slide ${index + 1}`} className={styles.sliderImage} />
        ))}
      </div>
    </div>
  );
};