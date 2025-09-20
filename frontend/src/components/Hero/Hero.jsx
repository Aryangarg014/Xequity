// import React, { useEffect, useState } from "react";
// import styles from "./Hero.module.css";
// import axios from "axios"; // Import axios for making API calls
// import { Link } from "react-router-dom"; // Import Link

// export const Hero = ({userEmail , email, name, description }) => {
//   const [profilePic, setProfilePic] = useState(""); // State to store the profile picture URL
//   const [loading, setLoading] = useState(true); // State to track loading state
//   const [tags, setTags] = useState([]); // State to store tags

//   useEffect(() => {
//     // Fetch profile picture and tags based on email when component mounts
//     const fetchProfilePic = async () => {
//       try {
//         const profileResponse = await axios.get(
//           `http://localhost:3001/profile/photo/${email}`
//         );
//         setProfilePic(profileResponse.data.profilePic); // Set the fetched profile picture URL

//         const tagsResponse = await axios.get(
//           `http://localhost:3001/profile/${email}`
//         );
//         if (tagsResponse.data.profile && tagsResponse.data.profile.tags) {
//           setTags(tagsResponse.data.profile.tags); // Set the fetched tags
//         }
//       } catch (error) {
//         console.error("Error fetching profile data:", error);
//       } finally {
//         setLoading(false); // Stop loading once data is fetched
//       }
//     };

//     fetchProfilePic();
//   }, [email]); // Run the effect when email changes

//   return (
//     <section className={styles.container}>
//       <div className={styles.content}>
//         <h1 className={styles.title}>{name}</h1>
//         <p className={styles.description}>{description}</p>

//         <div className={styles.investor_type}>
//           <div className={styles.investor_list}>
//             {tags.length > 0 ? (
//               tags.map((tag, index) => (
//                 <Link
//                   to={`/investors/tag/${encodeURIComponent(tag)}`}
//                   key={index}
//                 >
//                   <button className={styles.tag}>{tag}</button>
//                 </Link>
//               ))
//             ) : (
//               <p>No tags available</p>
//             )}
//           </div>
//         </div>

//         <Link to={`/messagePage/${userEmail}/${email}`} className={styles.contactBtn}>
//           Connect +
//         </Link>
//       </div>

//       {/* Display profile picture or loading state */}
//       {loading ? (
//         <div className={styles.heroImg}>Loading...</div>
//       ) : (
//         <img
//           src={profilePic || "http://localhost:3001/uploads/Investor.jpg"} // Default to Investor.jpg if no profilePic
//           alt="Profile"
//           className={styles.heroImg}
//         />
//       )}

//       <div className={styles.topBlur} />
//       <div className={styles.bottomBlur} />
//     </section>
//   );
// };


import React, { useEffect, useState } from "react";
import styles from "./Hero.module.css";
import axios from "axios"; // Import axios for making API calls
import { Link } from "react-router-dom"; // Import Link
import PremiumModal from "../../PremiumModal";
import { useNavigate } from "react-router-dom";
import { hasPremiumAccess, grantPremiumAccess } from "../../utils/premiumAccess";


export const Hero = ({ userEmail, email, name, description }) => {
  const [profilePic, setProfilePic] = useState(""); // State to store the profile picture URL
  const [loading, setLoading] = useState(true); // State to track loading state
  const [tags, setTags] = useState([]); // State to store tags


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


  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const navigate = useNavigate();

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


        <button onClick={handleConnectClick} className={styles.contactBtn}>
          Connect
        </button>


        <PremiumModal
          show={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onGetPremium={handleGetPremium}
        />
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
