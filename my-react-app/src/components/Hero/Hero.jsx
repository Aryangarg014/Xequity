import React, { useEffect, useState } from "react";
import styles from "./Hero.module.css";
import axios from "axios"; // Import axios for making API calls
import { Link } from "react-router-dom"; // Import Link

export const Hero = ({ email, name, description }) => {
  const [profilePic, setProfilePic] = useState(""); // State to store the profile picture URL
  const [loading, setLoading] = useState(true); // State to track loading state
  const [tags, setTags] = useState([]); // State to store tags

  // {console.log(email)}
  useEffect(() => {
    // Fetch profile picture and tags based on email when component mounts
    const fetchProfilePic = async () => {
      try {
        const profileResponse = await axios.get(
          `http://localhost:3001/profile/photo/${email}`
        );
        setProfilePic(profileResponse.data.profilePic); // Set the fetched profile picture URL

        const tagsResponse = await axios.get(
          `http://localhost:3001/profile/${email}`
        );
        if (tagsResponse.data.profile && tagsResponse.data.profile.tags) {
          setTags(tagsResponse.data.profile.tags); // Set the fetched tags
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    fetchProfilePic();
  }, [email]); // Run the effect when email changes

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>{name}</h1>
        <p className={styles.description}>{description}</p>

        <div className={styles.investor_type}>
          <div className={styles.investor_list}>
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <Link
                  to={`/investors/tag/${encodeURIComponent(tag)}`}
                  key={index}
                >
                  <button className={styles.tag}>{tag}</button>
                </Link>
              ))
            ) : (
              <p>No tags available</p>
            )}
          </div>
        </div>

        <a href={`mailto:${email}`} className={styles.contactBtn}>
          Connect +
        </a>
      </div>

      {/* Display profile picture or loading state */}
      {loading ? (
        <div className={styles.heroImg}>Loading...</div>
      ) : (
        <img
          src={profilePic || "http://localhost:3001/uploads/Investor.jpg"} // Default to Investor.jpg if no profilePic
          alt="Profile"
          className={styles.heroImg}
        />
      )}

      <div className={styles.topBlur} />
      <div className={styles.bottomBlur} />
    </section>
  );
};