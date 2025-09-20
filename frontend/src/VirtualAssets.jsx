import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./VirtualAssets.module.css";
import { useNavigate } from "react-router-dom";

// const NAV_LINKS = [
//     { label: "Virtual Assets", href: "/VirtualAssets" },
//     { label: "My Investments", href: "/MyInvestment" },
//     // Add more links as needed
// ];

// const TopNav = () => (
//     <nav className={styles.topnav}>
//         <div className={styles.navlinks}>
//             {NAV_LINKS.map((link) => (
//                 <a key={link.label} href={link.href} className={styles.navlink}>
//                     {link.label}
//                 </a>
//             ))}
//         </div>
//     </nav>
// );

const VirtualAssets = ({ userEmail }) => {
    const [assets, setAssets] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("http://localhost:3001/api/virtual-assets")
            .then((response) => {
                setAssets(response.data);
            })
            .catch((error) => {
                console.error("Error fetching virtual assets:", error);
            });
    }, []);

    const handleCardClick = (email) => {
        if (email) {
            navigate(`/TokenPage/${email}`, {
                state: { userEmail },
            });
        }
    };

    return (
        <div className={styles.virtualAssetsPage}>
            {/* <TopNav /> */}
            <main className={styles.mainContent}>
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Virtual Assets Marketplace</h1>
                    <p className={styles.pageSubtitle}>
                        Discover and invest in digital assets on the Xequity Exchange.
                    </p>
                </header>
                <section>
                    <div className={styles.assetsGrid}>
                        {assets.length > 0 ? (
                            assets.map((asset) => (
                                <div
                                    key={asset._id}
                                    className={styles.assetCard}
                                    onClick={() => handleCardClick(asset.email)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`View ${asset.TokenName}`}
                                >
                                    <div className={styles.assetImageContainer}>
                                        <img
                                            src={asset.image}
                                            alt={asset.TokenName}
                                            className={styles.assetImage}
                                        />
                                    </div>
                                    <div className={styles.assetContent}>
                                        <div className={styles.assetInfo}>
                                            <h2 className={styles.assetName}>{asset.TokenName}</h2>
                                        </div>
                                        <div className={styles.assetPriceSection}>
                                            <span className={styles.priceLabel}>Price</span>
                                            <span className={styles.priceValue}>
                                                {asset.CurrentPrice ? `₹${asset.CurrentPrice}` : "--"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>📉</div>
                                <div className={styles.emptyTitle}>No Virtual Assets Found</div>
                                <div className={styles.emptyDescription}>
                                    There are currently no assets available for trading.
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default VirtualAssets;













