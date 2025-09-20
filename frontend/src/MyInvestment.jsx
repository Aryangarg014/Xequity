import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./MyInvestment.module.css";

const MyInvestment = ({ useremail }) => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to fetch investments
    const fetchInvestments = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/my-investments/${useremail}`);
            if (response.data.status === "Success") {
                setTokens(response.data.tokens);
                // console.log("Fetched.");
            } else {
                console.error("Failed to fetch investments:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching investments:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch investments on component mount and set up interval for updates
    useEffect(() => {
        fetchInvestments(); // Initial fetch

        const interval = setInterval(() => {
            fetchInvestments(); // Fetch updated data every 5 seconds
        }, 5000);

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [useremail]);

    if (loading) {
        return <p>Loading investments...</p>;
    }

    if (tokens.length === 0) {
        return <p>No investments found.</p>;
    }

    return (
        <div className={styles.investmentContainer}>
            {tokens.map((token, index) => (
                <div key={index} className={styles.card}>
                    <div className={styles.left}>
                        <img
                            src={token.image ? `http://localhost:3001${token.image}` : "/default-token.png"}
                            alt={token.tokename}
                            className={styles.tokenImage}
                        />
                        <h3>{token.tokename}</h3>
                        <p>Quantity: {token.quantity}</p>
                    </div>
                    <div className={styles.right}>
                        <p>
                            <strong>Current Price:</strong>{" "}
                            <span className={styles.price}>
                                ₹{token.currentPrice ? (token.currentPrice * token.quantity).toFixed(2) : "--"}
                            </span>
                        </p>
                        <p>
                            <strong>Average Price:</strong>{" "}
                            <span className={styles.avgPrice}>
                                ₹{(token.avgprice * token.quantity).toFixed(2)}
                            </span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyInvestment;