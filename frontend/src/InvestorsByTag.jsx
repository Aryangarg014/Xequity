import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import styles from "./Investor.module.css";
import myImage from "./assets/Investor.png"; // Default profile image
import TrendingProducts from "./TrendingProducts";

const InvestorsByTag = () => {
    const { tagName } = useParams();
    const [investors, setInvestors] = useState([]);
    const [profilePics, setProfilePics] = useState({});

    useEffect(() => {
        const fetchInvestorsByTag = async () => {
            try {
                const response = await fetch(`http://localhost:3001/investors/tag/${encodeURIComponent(tagName)}`);
                const data = await response.json();
                if (data.status === "Success") {
                    setInvestors(data.investors);

                    // Fetch profile pics for each investor (Same logic as Investor.jsx)
                    data.investors.forEach((profile) => {
                        axios.get(`http://localhost:3001/profile/photo/${profile.email}`)
                            .then((res) => {
                                if (res.data.profilePic) {
                                    setProfilePics((prevState) => ({
                                        ...prevState,
                                        [profile.email]: res.data.profilePic
                                    }));
                                }
                            })
                            .catch((err) => console.error(`Error fetching image for ${profile.email}`, err));
                    });
                }
            } catch (error) {
                console.error("Error fetching investors by tag:", error);
            }
        };

        fetchInvestorsByTag();
    }, [tagName]);

    return (
        <div className={styles.Body}>
            <div className={styles.layoutRow}>
                <section className={styles.container}>
                    <div className={styles.filterTagMessage}>
                        <h2>Investors with tag: "{tagName}"</h2>
                    </div>
                    {investors.length > 0 ? (
                        investors.map((profile) => (
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
                            No investors match the tag "<b>{tagName}</b>"
                        </p>
                    )}
                </section>
                <TrendingProducts />
            </div>
        </div>
    );
};

export default InvestorsByTag;