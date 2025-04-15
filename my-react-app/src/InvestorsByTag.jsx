import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import styles from "./Investor.module.css";
import myImage from "./assets/Investor.png"; // Default profile image

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

                    // Fetch profile pics for each investor
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
            <div>
                <h2 className={styles.filterTagMessage}>Investors with tag: "{tagName}"</h2>
                <section className={styles.container}>
                    {investors.length > 0 ? (
                        investors.map((profile) => (
                            <div key={profile.email} className={styles.content}>
                                <Link to={`/InvestorPage/${profile.email}`} className={styles.detailsLink}>
                                    <img 
                                        src={profilePics[profile.email] || myImage} 
                                        alt="Profile" 
                                        className={styles.aboutImage} 
                                    />
                                    <ul className={styles.aboutItems}>
                                        <li className={styles.aboutItem}>
                                            <div className={styles.aboutItemText}>
                                                <h3>{profile.firstName || "Anonymous"}</h3>
                                                <p>{profile.headline}</p>
                                            </div>
                                        </li>
                                    </ul>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noResults}>
                            No investors match the tag "<b>{tagName}</b>"
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
};

export default InvestorsByTag;