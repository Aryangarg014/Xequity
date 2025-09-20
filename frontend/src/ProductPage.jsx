// // import React, { useEffect, useState } from "react";
// // import { useParams, useNavigate, useLocation } from "react-router-dom";
// // import axios from "axios";
// // import { Hero } from "./Prdcomponents/prdHero/Hero";
// // import styles from "./ProductPage.module.css";

// // import {
// //   BarChart,
// //   Bar,
// //   XAxis,
// //   YAxis,
// //   Tooltip,
// //   Legend,
// //   CartesianGrid,
// //   ResponsiveContainer,
// // } from "recharts";
// // import "./ProductPageChart.css"; // Styling for chart

// // const ProductPage = ({ userEmail }) => {
// //   const { email } = useParams();
// //   const [product, setProduct] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const location = useLocation();
// //   const navigate = useNavigate();

// //   const loggedInEmail = location.state?.loggedInEmail || "";

// //   const handleGainEquity = () => {
// //     navigate(`/gain-equity/${email}`);
// //   };

// //   useEffect(() => {
// //     axios
// //       .get(`http://localhost:3001/product/${email}`)
// //       .then((response) => {
// //         if (response.data.status === "Success") {
// //           setProduct(response.data.product);
// //         } else {
// //           setError("Failed to load product details.");
// //         }
// //       })
// //       .catch((err) => {
// //         setError("Error fetching product. Try again later.");
// //         console.error("Fetch Error:", err);
// //       })
// //       .finally(() => setLoading(false));
// //   }, [email]);

// //   return (
// //     <div className={styles.pageContainer}>
// //       {loading ? (
// //         <p className={styles.statusMessage}>Loading product...</p>
// //       ) : error ? (
// //         <p className={styles.statusError}>{error}</p>
// //       ) : (
// //         <>
// //           <Hero
// //             product={Array.isArray(product) ? product : [product]}
// //             email={email}
// //             loggedInEmail={loggedInEmail}
// //             userEmail={userEmail}
// //           />

// //           {/* Team Members Section */}
// //           {product?.team?.length > 0 && (
// //             <div className={styles.teamSection}>
// //               <h2 className={styles.teamTitle}>Meet the Team</h2>
// //               <div className={styles.teamGrid}>
// //                 {product.team.map((member, index) => (
// //                   <div className={styles.teamCard} key={index}>
// //                     <div className={styles.avatarPlaceholder}>
// //                       {member.name?.charAt(0).toUpperCase() || "U"}
// //                     </div>
// //                     <h3 className={styles.memberName}>{member.name}</h3>
// //                     <p className={styles.memberRole}>{member.position}</p>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}
// //           {/* ✅ Custom Sections from user */}
// //           {product?.customSections?.length > 0 && (
// //             <div className={styles.customSection}>
// //               <h2 className={styles.teamTitle}>Additional Information</h2>
// //               {product.customSections.map((section, index) => (
// //                 <div key={index} className={styles.sectionCard}>
// //                   <h3>{section.title}</h3>
// //                   <p>{section.description}</p>
// //                 </div>
// //               ))}
// //             </div>
// //           )}



// //           {/* Financial Chart */}
// //           {product?.finances?.length > 0 ? (
// //             <div className="chartContainer">
// //               <h2 className="chartTitle">Financial Overview</h2>
// //               <ResponsiveContainer width="95%" height={400}>
// //                 <BarChart
// //                   data={product.finances}
// //                   margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
// //                 >
// //                   <CartesianGrid strokeDasharray="3 3" />
// //                   <XAxis dataKey="year" />
// //                   <YAxis
// //                     tickFormatter={(value) => `₹${value.toLocaleString()}`}
// //                   />
// //                   <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
// //                   <Legend />
// //                   <Bar
// //                     dataKey="revenue"
// //                     fill="#00b894"
// //                     name="Revenue"
// //                     animationDuration={800}
// //                   />
// //                   <Bar
// //                     dataKey="expenses"
// //                     fill="#d63031"
// //                     name="Expenses"
// //                     animationDuration={800}
// //                   />
// //                 </BarChart>
// //               </ResponsiveContainer>
// //             </div>
// //           ) : (
// //             <div className="chartContainer">
// //               <h2 className="chartTitle">Financial Overview</h2>
// //               <p
// //                 style={{
// //                   color: "gray",
// //                   textAlign: "center",
// //                   fontSize: "18px",
// //                 }}
// //               >
// //                 No financial data available.
// //               </p>
// //             </div>
// //           )}


// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default ProductPage;

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { Hero } from "./Prdcomponents/prdHero/Hero";
// import styles from "./ProductPage.module.css";

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";
// import "./ProductPageChart.css";

// const ProductPage = ({ userEmail }) => {
//   const { email } = useParams();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const location = useLocation();
//   const navigate = useNavigate();

//   const loggedInEmail = location.state?.loggedInEmail || "";

//   useEffect(() => {
//     axios
//       .get(`http://localhost:3001/product/${email}`)
//       .then((response) => {
//         if (response.data.status === "Success") {
//           setProduct(response.data.product);
//         } else {
//           setError("Failed to load product details.");
//         }
//       })
//       .catch((err) => {
//         setError("Error fetching product. Try again later.");
//         console.error("Fetch Error:", err);
//       })
//       .finally(() => setLoading(false));
//   }, [email]);

//   const handleGainEquity = () => {
//     navigate(`/gain-equity/${email}`);
//   };

//   return (
//     <div className={styles.pageContainer}>
//       {loading ? (
//         <p className={styles.statusMessage}>Loading product...</p>
//       ) : error ? (
//         <p className={styles.statusError}>{error}</p>
//       ) : (
//         <>
//           <Hero
//             userEmail={userEmail}
//             product={Array.isArray(product) ? product : [product]}
//             email={email}
//             loggedInEmail={loggedInEmail}
//           />

//           {/* Team Section */}
//           {product?.team?.length > 0 && (
//             <div className={styles.teamSection}>
//               <h2 className={styles.teamTitle}>Meet the Team</h2>
//               <div className={styles.teamGrid}>
//                 {product.team.map((member, index) => (
//                   <div className={styles.teamCard} key={index}>
//                     <div className={styles.avatarPlaceholder}>
//                       {member.name?.charAt(0).toUpperCase() || "U"}
//                     </div>
//                     <h3 className={styles.memberName}>{member.name}</h3>
//                     <p className={styles.memberRole}>{member.position}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Custom Sections */}
//           {product?.customSections?.length > 0 && (
//             <div className={styles.customSection}>
//               <h2 className={styles.teamTitle}>Additional Information</h2>
//               {product.customSections.map((section, index) => (
//                 <div key={index} className={styles.sectionCard}>
//                   <h3>{section.title}</h3>
//                   <p>{section.description}</p>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Financial Chart */}
//           {product?.finances?.length > 0 ? (
//             <div className="chartContainer">
//               <h2 className="chartTitle">Financial Overview</h2>
//               <ResponsiveContainer width="95%" height={400}>
//                 <BarChart
//                   data={product.finances}
//                   margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="year" />
//                   <YAxis
//                     tickFormatter={(value) => `₹${value.toLocaleString()}`}
//                   />
//                   <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
//                   <Legend />
//                   <Bar
//                     dataKey="revenue"
//                     fill="#00b894"
//                     name="Revenue"
//                     animationDuration={800}
//                   />
//                   <Bar
//                     dataKey="expenses"
//                     fill="#d63031"
//                     name="Expenses"
//                     animationDuration={800}
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <div className="chartContainer">
//               <h2 className="chartTitle">Financial Overview</h2>
//               <p
//                 style={{
//                   color: "gray",
//                   textAlign: "center",
//                   fontSize: "18px",
//                 }}
//               >
//                 No financial data available.
//               </p>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default ProductPage;



// new jsx 8/7/25 night 
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { Hero } from "./Prdcomponents/prdHero/Hero";
// import styles from "./ProductPage.module.css";


// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";
// import "./ProductPageChart.css"; // Styling for chart


// const ProductPage = ({ userEmail }) => {
//   const { email } = useParams();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const location = useLocation();
//   const navigate = useNavigate();


//   const loggedInEmail = location.state?.loggedInEmail || "";


//   const handleGainEquity = () => {
//     navigate(`/gain-equity/${email}`);
//   };


//   useEffect(() => {
//     axios
//       .get(`http://localhost:3001/product/${email}`)
//       .then((response) => {
//         if (response.data.status === "Success") {
//           setProduct(response.data.product);
//         } else {
//           setError("Failed to load product details.");
//         }
//       })
//       .catch((err) => {
//         setError("Error fetching product. Try again later.");
//         console.error("Fetch Error:", err);
//       })
//       .finally(() => setLoading(false));
//   }, [email]);


//   return (
//     <div className={styles.pageContainer}>
//       {loading ? (
//         <p className={styles.statusMessage}>Loading product...</p>
//       ) : error ? (
//         <p className={styles.statusError}>{error}</p>
//       ) : (
//         <>
//           <Hero
//             product={Array.isArray(product) ? product : [product]}
//             email={email}
//             loggedInEmail={loggedInEmail}
//             userEmail={userEmail}
//           />


//           {/* Team Members Section */}
//           {product?.team?.length > 0 && (
//             <div className={styles.teamSection}>
//               <h2 className={styles.teamTitle}>Meet the Team</h2>
//               <div className={styles.teamGrid}>
//                 {product.team.map((member, index) => (
//                   <div className={styles.teamCard} key={index}>
//                     <div className={styles.avatarPlaceholder}>
//                       {member.name?.charAt(0).toUpperCase() || "U"}
//                     </div>
//                     <h3 className={styles.memberName}>{member.name}</h3>
//                     <p className={styles.memberRole}>{member.position}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//           {/* ✅ Custom Sections from user */}
//           {product?.customSections?.length > 0 && (
//             <div className={styles.customSection}>
//               <h2 className={styles.teamTitle}>Additional Information</h2>
//               {product.customSections.map((section, index) => (
//                 <div key={index} className={styles.sectionCard}>
//                   <h3>{section.title}</h3>
//                   <p>{section.description}</p>
//                 </div>
//               ))}
//             </div>
//           )}






//           {/* Financial Chart */}
//           {product?.finances?.length > 0 ? (
//             <div className="chartContainer">
//               <h2 className="chartTitle">Financial Overview</h2>
//               <ResponsiveContainer width="95%" height={400}>
//                 <BarChart
//                   data={product.finances}
//                   margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="year" />
//                   <YAxis
//                     tickFormatter={(value) => `₹${value.toLocaleString()}`}
//                   />
//                   <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
//                   <Legend />
//                   <Bar
//                     dataKey="revenue"
//                     fill="#00b894"
//                     name="Revenue"
//                     animationDuration={800}
//                   />
//                   <Bar
//                     dataKey="expenses"
//                     fill="#d63031"
//                     name="Expenses"
//                     animationDuration={800}
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <div className="chartContainer">
//               <h2 className="chartTitle">Financial Overview</h2>
//               <p
//                 style={{
//                   color: "gray",
//                   textAlign: "center",
//                   fontSize: "18px",
//                 }}
//               >
//                 No financial data available.
//               </p>
//             </div>
//           )}




//         </>
//       )}
//     </div>
//   );
// };


// export default ProductPage;


import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Hero } from "./Prdcomponents/prdHero/Hero";
import styles from "./ProductPage.module.css";
import PremiumModal from "./PremiumModal";


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./ProductPageChart.css";


const ProductPage = ({ userEmail }) => {
  const { email } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();


  const loggedInEmail = location.state?.loggedInEmail || "";


  useEffect(() => {
    axios
      .get(`http://localhost:3001/product/${email}`)
      .then((response) => {
        if (response.data.status === "Success") {
          setProduct(response.data.product);
        } else {
          setError("Failed to load product details.");
        }
      })
      .catch((err) => {
        setError("Error fetching product. Try again later.");
        console.error("Fetch Error:", err);
      })
      .finally(() => setLoading(false));
  }, [email]);


  const handleGainEquity = () => {
    navigate(`/gain-equity/${email}`);
  };


  const handleConnectClick = () => {
    setShowPremiumModal(true);
  };

  return (
    <div className={styles.pageContainer}>
      {loading ? (
        <p className={styles.statusMessage}>Loading product...</p>
      ) : error ? (
        <p className={styles.statusError}>{error}</p>
      ) : (
        <>
          <Hero
            userEmail={userEmail}
            product={Array.isArray(product) ? product : [product]}
            email={email}
            loggedInEmail={loggedInEmail}
            onConnectClick={handleConnectClick}
          />


          <div className={styles.sectionWrapper}>
            {/* Team Section */}
            {product?.team?.length > 0 && (
              <div className={styles.teamSection}>
                <h2 className={styles.teamTitle}>Meet the Team</h2>
                <div className={styles.teamGrid}>
                  {product.team.map((member, index) => (
                    <div className={styles.teamCard} key={index}>
                      <div className={styles.avatarPlaceholder}>
                        {member.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <h3 className={styles.memberName}>{member.name}</h3>
                      <p className={styles.memberRole}>{member.position}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Custom Sections */}
            {product?.customSections?.length > 0 && (
              <div className={styles.customSection}>
                <h2 className={styles.teamTitle}>Additional Information</h2>
                {product.customSections.map((section, index) => (
                  <div key={index} className={styles.sectionCard}>
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                  </div>
                ))}
              </div>
            )}


            {/* Financial Chart */}
            {product?.finances?.length > 0 ? (
              <div className="chartContainer">
                <h2 className="chartTitle">Financial Overview</h2>
                <ResponsiveContainer width="95%" height={400}>
                  <BarChart
                    data={product.finances}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      fill="#00b894"
                      name="Revenue"
                      animationDuration={800}
                    />
                    <Bar
                      dataKey="expenses"
                      fill="#d63031"
                      name="Expenses"
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="chartContainer">
                <h2 className="chartTitle">Financial Overview</h2>
                <p
                  style={{
                    color: "gray",
                    textAlign: "center",
                    fontSize: "18px",
                  }}
                >
                  No financial data available.
                </p>
              </div>
            )}
          </div>
        </>
      )}
     
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};


export default ProductPage;




