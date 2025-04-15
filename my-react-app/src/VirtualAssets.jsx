import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./VirtualAssets.module.css"; // Import CSS for styling

const VirtualAssets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:3001/api/virtual-assets")
            .then((response) => {
                setAssets(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching virtual assets:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.noAssets}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading virtual assets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {assets.length > 0 ? (
                    assets.map((asset) => (
                        <div key={asset._id} className={styles.card}>
                            <div className={styles.imageContainer}>
                                <img src={asset.image} alt={asset.TokenName} className={styles.image} />
                            </div>
                            <div className={styles.details}>
                                <h2>{asset.TokenName}</h2>
                                <p><strong>Price:</strong> <span className={styles.price}>₹{asset.CurrentPrice ? asset.CurrentPrice : "--"}</span></p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.noAssets}>
                        <p>No Virtual Assets Found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VirtualAssets;