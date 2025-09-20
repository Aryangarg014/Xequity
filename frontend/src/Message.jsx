// import React, { useEffect, useState } from "react";
// import myImage from "./assets/Investor.png";
// import productImage from "./assets/Product.gif";
// import styles from "./Message.module.css";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// function Message({ userEmail }) {
//   const [profiles, setProfiles] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [profilePics, setProfilePics] = useState({});
//   const [lastMessages, setLastMessages] = useState({});
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const msgRes = await fetch(`http://localhost:3001/messages/${userEmail}`);
//         const msgData = await msgRes.json();

//         if (msgData.status !== "Success") return;

//         const user2Set = new Set();
//         const lastMsgMap = {};

//         msgData.messages.forEach((msg) => {
//           const other =
//             msg.senderId === userEmail ? msg.receiverId : msg.senderId;
//           user2Set.add(other);

//           // Store latest message per other participant
//           if (
//             !lastMsgMap[other] ||
//             new Date(msg.createdAt) > new Date(lastMsgMap[other].createdAt)
//           ) {
//             lastMsgMap[other] = msg;
//           }
//         });

//         setLastMessages(lastMsgMap);

//         const user2Emails = Array.from(user2Set);

//         // Fetch investor profiles
//         const profileRes = await fetch("http://localhost:3001/profiles");
//         const profileData = await profileRes.json();

//         if (profileData.status === "Success") {
//           const investors = profileData.profiles.filter(
//             (profile) =>
//               profile.type === "investor" && user2Set.has(profile.email)
//           );
//           setProfiles(investors);

//           investors.forEach((profile) => {
//             axios
//               .get(`http://localhost:3001/profile/photo/${profile.email}`)
//               .then((res) => {
//                 if (res.data.profilePic) {
//                   setProfilePics((prev) => ({
//                     ...prev,
//                     [profile.email]: res.data.profilePic,
//                   }));
//                 }
//               })
//               .catch((err) =>
//                 console.error(`Error fetching image for ${profile.email}`, err)
//               );
//           });
//         }

//         // Fetch and filter products
//         const productRes = await fetch("http://localhost:3001/products");
//         const productData = await productRes.json();

//         if (productData.status === "Success") {
//           const filteredProducts = productData.products.filter((product) =>
//             user2Set.has(product.email)
//           );
//           setProducts(filteredProducts);
//         }
//       } catch (err) {
//         console.error("Failed to fetch messages or related data", err);
//       }
//     };

//     fetchData();
//   }, [userEmail]);

//   const goToInvestorProfile = (email, e) => {
//     e.stopPropagation();
//     navigate(`/InvestorPage/${email}`);
//   };

//   const goToProductProfile = (email, e) => {
//     e.stopPropagation();
//     navigate(`/ProductPage/${email}`);
//   };

//   const openChat = (otherEmail) => {
//     navigate(`/messagePage/${userEmail}/${otherEmail}`);
//   };

//   return (
//     <div className={styles.Body}>
//       <div className={styles.flexContainer}>
//         {/* Investor Column */}
//         <div className={styles.container}>
//           <h2 className={styles.sectionTitle}>Investors</h2>
//           {profiles.map((profile) => (
//             <div
//               className={styles.detailsLink}
//               key={profile.email}
//               onClick={() => openChat(profile.email)}
//               style={{ cursor: "pointer" }}
//             >
//               <div className={styles.content}>
//                 <img
//                   src={profilePics[profile.email] || myImage}
//                   alt="Investor"
//                   className={styles.aboutImage}
//                   onClick={(e) => goToInvestorProfile(profile.email, e)}
//                 />
//                 <ul className={styles.aboutItems}>
//                   <li className={styles.aboutItem}>
//                     <div className={styles.aboutItemText}>
//                       <h3>{profile.firstName || "Anonymous"}</h3>
//                       <p>{profile.headline}</p>
//                       <small className={styles.lastMessage}>
//                         {lastMessages[profile.email]?.text || "No message"}
//                       </small>
//                     </div>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Product Column */}
//         <div className={styles.container}>
//           <h2 className={styles.sectionTitle}>Products</h2>
//           {products.map((product) => (
//             <div
//               className={styles.detailsLink}
//               key={product.email}
//               onClick={() => openChat(product.email)}
//               style={{ cursor: "pointer" }}
//             >
//               <div className={styles.content}>
//                 <img
//                   src={productImage}
//                   alt="Product"
//                   className={styles.aboutImage}
//                   onClick={(e) => goToProductProfile(product.email, e)}
//                 />
//                 <ul className={styles.aboutItems}>
//                   <li className={styles.aboutItem}>
//                     <div className={styles.aboutItemText}>
//                       <h3>{product.productName}</h3>
//                       <p>{product.description}</p>
//                       <small className={styles.lastMessage}>
//                         {lastMessages[product.email]?.text || "No message"}
//                       </small>
//                     </div>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Message;

import React, { useEffect, useState } from "react";
import myImage from "./assets/Investor.png";
import productImage from "./assets/Product.gif";
import pfp from "../assests/propfp.jpg";
import pfp2 from "../assests/propfp2.jpg";
import styles from "./Message.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Message({ userEmail }) {
  const [profiles, setProfiles] = useState([]);
  const [products, setProducts] = useState([]);
  const [profilePics, setProfilePics] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const msgRes = await fetch(`http://localhost:3001/messages/${userEmail}`);
        const msgData = await msgRes.json();

        if (msgData.status !== "Success") return;

        const user2Set = new Set();
        const lastMsgMap = {};

        msgData.messages.forEach((msg) => {
          const other = msg.senderId === userEmail ? msg.receiverId : msg.senderId;
          user2Set.add(other);

          if (
            !lastMsgMap[other] ||
            new Date(msg.createdAt) > new Date(lastMsgMap[other].createdAt)
          ) {
            lastMsgMap[other] = msg;
          }
        });

        setLastMessages(lastMsgMap);

        const user2Emails = Array.from(user2Set);

        const profileRes = await fetch("http://localhost:3001/profiles");
        const profileData = await profileRes.json();

        if (profileData.status === "Success") {
          const investors = profileData.profiles.filter(
            (profile) =>
              profile.type === "investor" && user2Set.has(profile.email)
          );
          setProfiles(investors);

          investors.forEach((profile) => {
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

        const productRes = await fetch("http://localhost:3001/products");
        const productData = await productRes.json();

        if (productData.status === "Success") {
          const filteredProducts = productData.products.filter((product) =>
            user2Set.has(product.email)
          );
          setProducts(filteredProducts);
        }
      } catch (err) {
        console.error("Failed to fetch messages or related data", err);
      }
    };

    fetchData();
  }, [userEmail]);

  const goToInvestorProfile = (email, e) => {
    e.stopPropagation();
    navigate(`/InvestorPage/${email}`);
  };

  const goToProductProfile = (email, e) => {
    e.stopPropagation();
    navigate(`/ProductPage/${email}`);
  };

  const openChat = (otherEmail) => {
    navigate(`/messagePage/${userEmail}/${otherEmail}`);
  };

  return (
    <div className={styles.Body}>
      <div className={styles.flexContainer}>
        {/* Investor Column */}
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Investors</h2>
          {profiles.map((profile) => (
            <div
              className={styles.detailsLink}
              key={profile.email}
              onClick={() => openChat(profile.email)}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.content}>
                <img
                  src={profilePics[profile.email] || myImage}
                  alt="Investor"
                  className={styles.aboutImage}
                  onClick={(e) => goToInvestorProfile(profile.email, e)}
                />
                <ul className={styles.aboutItems}>
                  <li className={styles.aboutItem}>
                    <div className={styles.aboutItemText}>
                      <h3>{profile.firstName || "Anonymous"}</h3>
                      <p>{profile.headline}</p>
                      <small className={styles.lastMessage}>
                        {lastMessages[profile.email]?.text || "No message"}
                      </small>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Product Column */}
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Products</h2>
          {products.map((product, index) => (
            <div
              className={styles.detailsLink}
              key={product.email}
              onClick={() => openChat(product.email)}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.content}>
                <img
                  src={product.profilePic || (index % 2 === 0 ? pfp2 : pfp)}
                  alt="Product"
                  className={styles.aboutImage}
                  onClick={(e) => goToProductProfile(product.email, e)}
                  onError={(e) => {
                    e.target.src = index % 2 === 0 ? pfp2 : pfp;
                  }}
                />
                <ul className={styles.aboutItems}>
                  <li className={styles.aboutItem}>
                    <div className={styles.aboutItemText}>
                      <h3>{product.productName}</h3>
                      <p>{product.description}</p>
                      <small className={styles.lastMessage}>
                        {lastMessages[product.email]?.text || "No message"}
                      </small>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Message;
