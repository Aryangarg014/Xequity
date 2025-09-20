import React, { useEffect, useState } from "react";
import myImage from "./assets/Investor.png";
import styles from "./Investor.module.css";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import TrendingProducts from "./TrendingProducts";

function Investor() {
  const [profiles, setProfiles] = useState([]);
  const [profilePics, setProfilePics] = useState({});
  const [trendingProducts, setTrendingProducts] = useState([]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("q") || "";

  // Fetch investor profiles and their images
  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const response = await fetch(`http://localhost:3001/investors?q=${query}`);
        const data = await response.json();
        if (data.status === "Success") {
          setProfiles(data.investors);

          // Fetch profile pictures for each investor
          data.investors.forEach((profile) => {
            axios
              .get(`http://localhost:3001/profile/photo/${profile.email}`)
              .then((res) => {
                if (res.data.profilePic) {
                  setProfilePics((prev) => ({
                    ...prev,
                    [profile.email]: res.data.profilePic,
                  }));
                }
              })
              .catch((err) =>
                console.error(`Error fetching image for ${profile.email}`, err)
              );
          });
        }
      } catch (error) {
        console.error("Failed to fetch investors:", error);
      }
    };

    fetchInvestors();
  }, [query]);

  // Fetch trending products every 5 seconds
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
    <div className={styles.Body}>
      <div className={styles.layoutRow}>
        <section className={styles.container}>
          {profiles.length > 0 ? (
            profiles.map((profile) => (
              <Link
                to={`/InvestorPage/${profile.email}`}
                className={styles.detailsLink}
                key={profile.email}
              >
                <div className={styles.card}>
                  <img
                    src={profilePics[profile.email] || myImage}
                    alt="Profile"
                    className={styles.profileImage}
                  />
                  <div className={styles.investorName}>
                    {profile.firstName || "Anonymous"}
                  </div>
                  <div className={styles.investorHeadline}>
                    {profile.headline}
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.actionBtn}>Connect</button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className={styles.noResults}>
              No investors match your search "<b>{query}</b>"
            </p>
          )}
        </section>
        <TrendingProducts />
      </div>
    </div>
  );
}

export default Investor;
