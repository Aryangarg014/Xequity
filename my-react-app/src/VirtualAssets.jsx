import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./VirtualAssets.module.css"; // Import CSS for styling

const VirtualAssets = () => {
    const [assets, setAssets] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3001/api/virtual-assets")
            .then((response) => {
                setAssets(response.data);
            })
            .catch((error) => {
                console.error("Error fetching virtual assets:", error);
            });
    }, []);

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
                                <p><strong>Price:</strong> {asset.CurrentPrice ? asset.CurrentPrice : "--"}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No Virtual Assets Found</p>
                )}
            </div>
        </div>
    );
};

export default VirtualAssets;