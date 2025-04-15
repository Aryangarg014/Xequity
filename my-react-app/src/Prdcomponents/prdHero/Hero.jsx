import React, { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";
import pfp from "../../../assests/propfp.jpg";
import imagem from "../../../assests/product_image1.avif";
import imagem2 from "../../../assests/product_image2.jpeg";
import imagem3 from "../../../assests/product_image3.jpeg";
import { Link } from "react-router-dom";

export const Hero = ({ product=[], email, loggedInEmail }) => {
  const sliderImages = product[0]?.images?.length > 0 ? product[0].images : [];
  const sliderRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Add a scroll animation effect to elements as they come into view
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
        }
      });
    }, { threshold: 0.1 });
    
    // Observe slider images
    const sliderImages = document.querySelectorAll(`.${styles.sliderImage}`);
    sliderImages.forEach(img => observer.observe(img));
    
    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll(
      `.${styles.fadeIn}, .${styles.slideInLeft}, .${styles.slideInRight}, .${styles.scaleIn}`
    );
    animatedElements.forEach(el => observer.observe(el));
    
    return () => {
      sliderImages.forEach(img => {
        if (observer && img) observer.unobserve(img);
      });
      animatedElements.forEach(el => {
        if (observer && el) observer.unobserve(el);
      });
    };
  }, []);
  
  // Add horizontal scroll support for multi-touch trackpad gestures
  useEffect(() => {
    const handleWheel = (e) => {
      // Only respond to horizontal scrolling events (likely from trackpad)
      if (e.deltaX !== 0) {
        // This is a horizontal scroll event (likely a two-finger swipe on trackpad)
        if (sliderRef.current) {
          // Let the browser handle this natively
          return true;
        }
      } else if (e.deltaY !== 0) {
        // This is a vertical scroll, but we'll use it for horizontal scrolling
        // to support mouse wheel users
        if (sliderRef.current) {
          e.preventDefault();
          sliderRef.current.scrollLeft += e.deltaY;
        }
      }
    };
    
    const slider = sliderRef.current;
    if (slider) {
      // Add wheel event listener, but allow default horizontal scrolling
      slider.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (slider) {
        slider.removeEventListener('wheel', handleWheel);
      }
    };
  }, [sliderRef]);
  
  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Function to scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className={styles.all}>
      {/* Background elements */}
      <div className={styles.topBackground}></div>
      <div className={styles.gradientOverlay}></div>
      <div className={styles.sectionBackground}></div>
      
      <section className={styles.container}>
        <div className={styles.content}>
          {product.map((item, index) => (
            <div key={index}>
              <h1 className={`${styles.title} ${styles.slideInLeft}`}>{item?.productName || "Product Name"}</h1>
              <p className={`${styles.description} ${styles.slideInLeft} ${styles.delay200}`}>{item?.description || "Product description not available."}</p>
              <p className={`${styles.email} ${styles.fadeIn} ${styles.delay400}`}>Contact: {email}</p>
              <div className={`${styles.investor_type} ${styles.fadeIn} ${styles.delay600}`}>
                <div className={styles.investor_list}>
                  {item?.tags?.map((tag, i) => (
                    <Link key={i} to={`/products-by-tag/${tag}`}>
                      <button className={styles.tag}>{tag}</button>
                    </Link>
                  ))}
                </div>
              </div>

              {loggedInEmail === email && (
                <div className={`${styles.buttonContainer} ${styles.fadeIn} ${styles.delay600}`}>
                  <button className={styles.buyTokens}>Buy Tokens</button>
                  <button className={styles.gainEquity}>Gain Equity</button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Product logo on the right side */}
        <div className={styles.rightside}>
          <img 
            src={product[0]?.images.length>0 ? product[0]?.images[0] : pfp} 
            alt="Product" 
            className={`${styles.heroImg}`}
          />
        </div>
      </section>
      
      <div className={styles.lowerSection}>
        <div className={styles.imageSlider} ref={sliderRef}>
          {/* Use actual images if available, otherwise use placeholders */}
          {sliderImages.length > 0 ? (
            sliderImages.map((image, index) => (
              <img key={index} src={image} alt={`Product view ${index + 1}`} className={styles.sliderImage} />
            ))
          ) : (
            <>
              <img src={imagem} alt="Product view 1" className={styles.sliderImage} />
              <img src={imagem2} alt="Product view 2" className={styles.sliderImage} />
              <img src={imagem3} alt="Product view 3" className={styles.sliderImage} />
              <img src={imagem3} alt="Product view 4" className={styles.sliderImage} />
            </>
          )}
        </div>
      </div>
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <button 
          className={styles.scrollTopButton}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
};