// import React, { useState } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import "./Headbar.css";
// import projectlogo from "./assets/logo_text.png";
// import searchicon from "./assets/search_icon.png";
// import SearchBar from "./SearchBar/SearchBar";
// import { Link } from "react-router-dom";


// function Headbar({ isLoggedIn, userName, setUserName, setIsLoggedIn, userData }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const navigate = useNavigate();

//   const toggleMenu = () => {
//     setMenuOpen(!menuOpen);
//     setDropdownOpen(!dropdownOpen);
//   };

//   const closeDropdown = () => {
//     setMenuOpen(false);
//     setDropdownOpen(false);
//   };

//   const handleLogout = () => {
//     setUserName("Guest");
//     setIsLoggedIn();
//     // Clear localStorage
//     // localStorage.removeItem('userEmail');
//     closeDropdown();
//     navigate("/login");
//   };

//   const handleProfileRedirect = () => {
//     closeDropdown();
//     if (userData?.email) {
//       navigate(`/profile/${userData.email}`);
//     }
//   };

//   const handleMyProductsRedirect = () => {
//     closeDropdown();
//     if (userData?.email) {
//       navigate(`/company/${userData.email}`, { state: { loggedInEmail: userData.email } }); // Redirects to Company.jsx
//     }
//   };

//   const handleHistoryRedirect = () => {
//     closeDropdown();
//     if (userData?.email) {
//       navigate(`/transaction-history/${userData.email}`);
//     }
//   };


//   // my token
//   const handleMyTokensRedirect = () => {
//     closeDropdown();
//     if (userData?.email) {
//       navigate(`/mytokens/${userData.email}`);
//     }
//   };


//   return (
//     <div className="navbar">
//       {/* <img src={projectlogo} alt="Project Logo" className="logo" /> */}
//       <Link to="/">
//         <img src={projectlogo} alt="Project Logo" className="logo" />
//       </Link>

//       <ul className={`lists ${menuOpen ? "open" : ""}`}>
//         <li>
//           <NavLink to="/" className={({ isActive }) => (isActive ? "active-link" : "")}>
//             Home
//           </NavLink>
//         </li>
//         <li>
//           <NavLink to="/product" className={({ isActive }) => (isActive ? "active-link" : "")}>
//             Product
//           </NavLink>
//         </li>
//         <li>
//           <NavLink to="/VirtualAssets" className={({ isActive }) => (isActive ? "active-link" : "")}>
//             Virtual Assets
//           </NavLink>
//         </li>



//         <li>
//           <NavLink to="/investor" className={({ isActive }) => (isActive ? "active-link" : "")}>
//             Investor
//           </NavLink>
//         </li>
//         <li>
//           <NavLink to="/connect" className={({ isActive }) => (isActive ? "active-link" : "")}>
//             Inbox
//           </NavLink>
//         </li>
//       </ul>

//       <SearchBar></SearchBar>

//       <div className="hamburger-icon" onClick={toggleMenu}>
//         <div className={`bar ${menuOpen ? "open" : ""}`}></div>
//         <div className={`bar ${menuOpen ? "open" : ""}`}></div>
//         <div className={`bar ${menuOpen ? "open" : ""}`}></div>
//       </div>

//       {dropdownOpen && (
//         <div className="dropdown-div">
//           {isLoggedIn ? (
//             <div className="content">
//               <h3>Welcome, {userName}!</h3>

//               {userData?.type === "company" ? (
//                 <button onClick={handleMyProductsRedirect} className="profile-btn">
//                   My Products
//                 </button>
//               ) : (
//                 <button onClick={handleProfileRedirect} className="profile-btn">
//                   My Profile
//                 </button>
//               )}
//               <button onClick={() => {
//                 closeDropdown();
//                 if (userData?.email) {
//                   navigate(`/kyc/${userData.email}`);
//                 }
//               }} className="profile-btn">
//                 KYC Form
//               </button>

//               <button onClick={handleMyTokensRedirect} className="profile-btn">
//                 Investments
//               </button>
//               <button onClick={handleHistoryRedirect} className="profile-btn">
//                 History
//               </button>
//               <button onClick={handleLogout} className="logout-btn">
//                 Logout
//               </button>
//             </div>
//           ) : (
//             <div className="content">
//               <h3>Welcome, Guest!</h3>
//               <button onClick={() => navigate("/login")} className="logout-btn">
//                 Login
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default Headbar;

import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Headbar.css";
import projectlogo from "./assets/logo_text.png";
import searchicon from "./assets/search_icon.png";
import SearchBar from "./SearchBar/SearchBar";
import { Link } from "react-router-dom";

function Headbar({ isLoggedIn, userName, setUserName, setIsLoggedIn, userData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    setUserName("Guest");
    setIsLoggedIn();
    closeDropdown();
    navigate("/login");
  };

  const handleProfileRedirect = () => {
    closeDropdown();
    if (userData?.email) {
      navigate(`/profile/${userData.email}`);
    }
  };

  const handleMyProductsRedirect = () => {
    closeDropdown();
    if (userData?.email) {
      navigate(`/company/${userData.email}`, {
        state: { loggedInEmail: userData.email },
      });
    }
  };

  const handleHistoryRedirect = () => {
    closeDropdown();
    if (userData?.email) {
      navigate(`/transaction-history/${userData.email}`);
    }
  };

  const handleMyTokensRedirect = () => {
    closeDropdown();
    if (userData?.email) {
      navigate(`/mytokens/${userData.email}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="navbar">
      <Link to="/">
        <img src={projectlogo} alt="Project Logo" className="logo" />
      </Link>

      <ul className={`lists ${menuOpen ? "open" : ""}`}>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active-link" : "")}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/product" className={({ isActive }) => (isActive ? "active-link" : "")}>
            Product
          </NavLink>
        </li>
        <li>
          <NavLink to="/VirtualAssets" className={({ isActive }) => (isActive ? "active-link" : "")}>
            Virtual Assets
          </NavLink>
        </li>
        <li>
          <NavLink to="/investor" className={({ isActive }) => (isActive ? "active-link" : "")}>
            Investor
          </NavLink>
        </li>
        <li>
          <NavLink to="/connect" className={({ isActive }) => (isActive ? "active-link" : "")}>
            Inbox
          </NavLink>
        </li>
      </ul>

      <SearchBar />

      <div className="hamburger-icon" onClick={toggleMenu}>
        <div className={`bar ${menuOpen ? "open" : ""}`}></div>
        <div className={`bar ${menuOpen ? "open" : ""}`}></div>
        <div className={`bar ${menuOpen ? "open" : ""}`}></div>
      </div>

      {dropdownOpen && (
        <div className="dropdown-div" ref={dropdownRef}>
          {isLoggedIn ? (
            <div className="content">
              <h3>Welcome, {userName}!</h3>

              {userData?.type === "company" ? (
                <button onClick={handleMyProductsRedirect} className="profile-btn">
                  My Products
                </button>
              ) : (
                <button onClick={handleProfileRedirect} className="profile-btn">
                  My Profile
                </button>
              )}

              <button
                onClick={() => {
                  closeDropdown();
                  if (userData?.email) {
                    navigate(`/kyc/${userData.email}`);
                  }
                }}
                className="profile-btn"
              >
                KYC Form
              </button>

              <button onClick={handleMyTokensRedirect} className="profile-btn">
                Investments
              </button>
              <button onClick={handleHistoryRedirect} className="profile-btn">
                History
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="content">
              <h3>Welcome, Guest!</h3>
              <button onClick={() => navigate("/login")} className="logout-btn">
                Login
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Headbar;
