import React, { useEffect, useState } from "react";
import myImage from "./assets/Investor.png";
import styles from "./Investor.module.css";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";

function Investor() {
    const [profiles, setProfiles] = useState([]); // State to hold investor profiles
    const [profilePics, setProfilePics] = useState({});

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("q") || "";

    useEffect(() => {
        const fetchInvestors = async () => {
            try {
                const response = await fetch(`http://localhost:3001/investors?q=${query}`);
                const data = await response.json();
                if (data.status === "Success") {
                    setProfiles(data.investors);

                    data.investors.forEach(profile => {
                        axios.get(`http://localhost:3001/profile/photo/${profile.email}`)
                            .then((response) => {
                                if (response.data.profilePic) {
                                    setProfilePics(prevState => ({
                                        ...prevState,
                                        [profile.email]: response.data.profilePic
                                    }));
                                }
                            })
                            .catch((err) => console.error(`Error fetching image for ${profile.email}`, err));
                    });
                }
            } catch (error) {
                console.error("Failed to fetch investors:", error);
            }
        };

        fetchInvestors();
    }, [query]); // Fetch data whenever the search query changes

    return (
        <div className={styles.Body}>
            <div>
                <section className={styles.container}>
                    {profiles.length > 0 ? (
                        profiles.map((profile) => (
                            <Link
                                to={`/InvestorPage/${profile.email}`} // Passing email in the URL
                                className={styles.detailsLink}
                                key={profile.email}
                            >
                                <div className={styles.content}>
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
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className={styles.noResults}>
                            No investors match your search "<b>{query}</b>"
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

export default Investor;