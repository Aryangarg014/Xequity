import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./MyInvestment.module.css"; // Import CSS

const MyInvestment = () => {
    const { email } = useParams();
    const [tokens, setTokens] = useState([]);

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/user-tokens/${email}`);
                setTokens(response.data);
            } catch (error) {
                console.error("Error fetching tokens:", error);
            }
        };

        if (email) {
            fetchTokens();
        }
    }, [email]);

    return (
        <div className={styles.container}>
            <h1>My Investments</h1>
            {tokens.length > 0 ? (
                <div className={styles.tableContainer}>
                    <table>
                        <thead>
                            <tr>
                                <th>Token Name</th>
                                <th>Quantity</th>
                                <th>Average Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tokens.map((token, index) => (
                                <tr key={index}>
                                    <td>{token.tokenmail}</td>
                                    <td>{token.quantity}</td>
                                    <td>₹{token.avgprice.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className={styles.noInvestments}>No investments found.</p>
            )}
        </div>
    );
};

export default MyInvestment;