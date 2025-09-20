import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Hero.module.css";
import { FaHeart } from "react-icons/fa";
import PremiumModal from "../../PremiumModal";
import pfp from "../../../assests/propfp.jpg";
import pfp2 from "../../../assests/propfp2.jpg";
import {
  hasPremiumAccess,
  grantPremiumAccess,
} from "../../utils/premiumAccess";


export const Hero = ({ userEmail, product = [], email, loggedInEmail }) => {
  const navigate = useNavigate();
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const productEmail = email;


  useEffect(() => {
    const checkUpvoteStatus = async () => {
      if (userEmail && productEmail) {
        try {
          const res = await fetch(
            `http://localhost:3001/user/${userEmail}/${productEmail}`
          );
          const data = await res.json();
          setUpvoted(data.upvoted);
        } catch (error) {
          console.error("Error checking upvote status:", error);
        }
      }
    };


    const fetchUpvotes = () => {
      if (product[0]?.upvote !== undefined) {
        setUpvoteCount(product[0].upvote);
      }
    };


    checkUpvoteStatus();
    fetchUpvotes();
  }, [userEmail, productEmail, product]);


  const handleUpvote = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/upvote/${userEmail}/${productEmail}`
      );
      const data = await res.json();
      if (data.status === "Success") {
        setUpvoted(data.upvoted);
        setUpvoteCount(data.upvotes);
      }
    } catch (err) {
      console.error("Error handling upvote:", err);
    }
  };


  const handleBuyToken = () => {
    navigate(`/buy-token/${email}`);
  };


  const handleGainEquity = () => {
    navigate(`/gain-equity/${email}`);
  };


  const sliderImages = product[0]?.images?.length > 0 ? product[0].images : [];
  const profilePic = product[0]?.profilePic || pfp; // Fallback to first image if profilePic doesn't exist


  const [showPremiumModal, setShowPremiumModal] = useState(false);


  const handleConnectClick = () => {
    if (hasPremiumAccess(userEmail)) {
      navigate(`/messagePage/${userEmail}/${email}`);
    } else {
      setShowPremiumModal(true);
    }
  };


  const handleGetPremium = () => {
    grantPremiumAccess(userEmail); // Store premium for this user only
    setShowPremiumModal(false);
    navigate(`/messagePage/${userEmail}/${email}`);
  };




  return (
    <div className={styles.all}>
      <section className={styles.container}>
        <div className={styles.content}>
          {product.map((item, index) => (
            <div key={index} className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <div className={styles.profileImageContainer}>
                  <img src={profilePic} alt="Product" className={styles.profileImage} />
                </div>
                <div className={styles.profileInfo}>
                  <h1 className={styles.title}>{item?.productName || "Product Name"}</h1>
                  {/* <p className={styles.email}>Contact: {email}</p> */}
                </div>
              </div>

              <p className={styles.description}>{item?.description || "Product description not available."}</p>


              <div className={styles.investor_type}>
                <div className={styles.investor_list}>
                  {item?.tags?.map((tag, i) => (
                    <Link key={i} to={`/products-by-tag/${tag}`}>
                      <button className={styles.tag}>{tag}</button>
                    </Link>
                  ))}
                </div>
              </div>


              <div className={styles.upvoteContainer}>
                <FaHeart
                  onClick={handleUpvote}
                  className={styles.heartIcon}
                  color={upvoted ? "red" : "gray"}
                  style={{ cursor: "pointer", marginRight: "8px" }}
                />
                <span>{upvoteCount} Upvotes</span>
              </div>

              <button
                onClick={handleConnectClick}
                className={styles.contactBtn}
              >
                Connect +
              </button>


              <PremiumModal
                show={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                onGetPremium={handleGetPremium}
              />
            </div>
          ))}
        </div>
      </section>


      <div className={styles.imageSlider}>
        {sliderImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className={styles.sliderImage}
          />
        ))}
      </div>


      {loggedInEmail === email && (
        <div className={styles.buttonContainer}>
          <button className={styles.buyTokens} onClick={handleBuyToken}>
            Buy Tokens
          </button>
          <button className={styles.gainEquity} onClick={handleGainEquity}>
            Gain Equity
          </button>
        </div>
      )}
    </div>
  );
};
export default Hero;