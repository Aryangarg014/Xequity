import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./TokenPage.module.css";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";






const TokenPage = () => {
    const [userBuyTickets, setUserBuyTickets] = useState([]);
    const [userSellTickets, setUserSellTickets] = useState([]);
    const { email } = useParams();
    const [tokenData, setTokenData] = useState(null);
    const [productData, setProductData] = useState(null);
    const [sellBids, setSellBids] = useState([]);
    const [buyBids, setBuyBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(0);
    const [Bid, setBid] = useState(0);
    const [price, setPrice] = useState(0);
    const location = useLocation();
    const UserEmail = location.state?.userEmail;
    console.log(UserEmail)
    useEffect(() => {
        const fetchAllData = async () => {
            try {


                // Fetch token and product data
                const tokenResponse = await axios.get(
                    `http://localhost:3001/api/virtual-assets-with-product/${email}`
                );


                // Fetch sell bids
                const sellBidsResponse = await axios.get(
                    `http://localhost:3001/api/sell-bids/${email}`
                );


                // Fetch buy bids
                const buyBidsResponse = await axios.get(
                    `http://localhost:3001/api/buy-bids/${email}`
                );
                setSellBids(sellBidsResponse.data.sellBids || []);
                setBuyBids(buyBidsResponse.data.buyBids || []);
                setTokenData(tokenResponse.data.token);
                setProductData(tokenResponse.data.product);
                // Fetch user's personal tickets
                const tokenname = tokenResponse.data.token?.TokenName; // ✅ extract safely
                const userBuyRes = await axios.get("http://localhost:3001/api/user-buy-tickets", {
                    params: {
                        useremail: UserEmail,
                        tokenemail: email,
                        tokenname
                    }
                });
                const userSellRes = await axios.get("http://localhost:3001/api/user-sell-tickets", {
                    params: {
                        useremail: UserEmail,
                        tokenemail: email,
                        tokenname
                    }
                });
                setUserBuyTickets(userBuyRes.data.tickets || []);
                setUserSellTickets(userSellRes.data.tickets || []);
                setPrice(tokenResponse.data.token.CurrentPrice || 0);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        // Initial fetch
        fetchAllData();


        // Set up interval for real-time updates (every 2 seconds)
        const intervalId = setInterval(fetchAllData, 2000);


        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [email]);


    const handleBuy = async () => {
        try {
            await axios.post("http://localhost:3001/buy-token", {
                email: UserEmail,                      // Buyer's email
                tokenemail: email,                     // Token's company email
                tokenname: tokenData.TokenName,        // Token name
                quantity: Number(quantity),
                price: Number(Bid),
            });
            console.log("Buy placed!");
            setQuantity(0);
            setBid(0);
        } catch (err) {
            console.error("Buy failed", err);
        }
    };


    const handleSell = async () => {
        try {
            await axios.post("http://localhost:3001/sell-token", {
                email: UserEmail,                      // Seller's email
                tokenemail: email,                     // Token's company email
                tokenname: tokenData.TokenName,        // Token name
                quantity: Number(quantity),
                price: Number(Bid),
            });
            console.log("Sell placed!");
            setQuantity(0);
            setBid(0);
        } catch (err) {
            console.log("Sell failed becuase of insufficient token");
            setQuantity(0);
            setBid(0); setQuantity(0);
            setBid(0);
        }
    };


    const cancelBuy = async (ticket) => {
        try {
            await axios.delete("http://localhost:3001/api/cancel-buy-ticket", {
                data: {
                    useremail: UserEmail,
                    tokenemail: email,
                    tokenname: tokenData.TokenName,
                    time: ticket.time,
                    quantity : ticket.quantity, 
                    price : ticket.price
                }
            });
            alert("Buy ticket cancelled!");
        } catch (err) {
            console.error("Error cancelling buy ticket", err);
        }
    };


    const cancelSell = async (ticket) => {
        try {
            await axios.delete("http://localhost:3001/api/cancel-sell-ticket", {
                data: {
                    useremail: UserEmail,
                    tokenemail: email,
                    tokenname: tokenData.TokenName,
                    time: ticket.time,
                    quantity : ticket.quantity, 
                    price : ticket.price 
                }
            });
            alert("sell ticket cancelled!");
        } catch (err) {
            console.error("Error cancelling sell ticket", err);
        }
    };


    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <p>Loading...</p>
            </div>
        );
    }


    if (!tokenData || !productData) {
        return <p>No token or product data available</p>;
    }


    return (
        <div className={styles.container}>
            <div className={styles.mainLayout}>
                {/* Trading Sidebar - Left */}
                <div className={styles.tradingSidebar}>
                    <h2>Trade</h2>
                    <div className={styles.tradingActions}>
                        <button className={styles.buyBtn} onClick={handleBuy}>
                            BUY
                        </button>
                        <button className={styles.sellBtn} onClick={handleSell}>
                            SELL
                        </button>
                    </div>


                    <div className={styles.tradingFormGroup}>
                        <label>Quantity</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="1"
                        />
                    </div>


                    <div className={styles.tradingFormGroup}>
                        <label>Price</label>
                        <input
                            type="number"
                            value={Bid}
                            onChange={(e) => setBid(e.target.value)}
                            min="1"
                        />
                    </div>


                    <div className={styles.orderSummary}>
                        <div className={styles.orderSummaryItem}>
                            <span>Total Value:</span>
                            <span>{(quantity * Bid).toFixed(2)}</span>
                        </div>
                        <div className={styles.orderTotal}>
                            <span>Order Total : </span>
                            <span>{(quantity * Bid).toFixed(2)}</span>
                        </div>
                    </div>
                </div>


                {/* Main Content - Center */}
                <div className={styles.mainContent}>
                    {/* Token Header Section */}
                    <div className={styles.header}>
                        <img src={tokenData.image} alt={tokenData.TokenName} className={styles.tokenImage} />
                        <div className={styles.tokenInfo}>
                            <h1 className={styles.tokenamestyle}>{tokenData.TokenName}</h1>
                            <p className={styles.price}>
                                <strong>Price:</strong> {tokenData.CurrentPrice ? `₹${tokenData.CurrentPrice}` : "--"}
                            </p>
                        </div>
                    </div>


                    {/* Overview Section */}
                    <div className={styles.overview}>
                        <h2>Overview</h2>
                        <p><strong>Number of Tokens Issued:</strong> {tokenData.NumberOfIssue}</p>
                        <p><strong>Equity Diluted:</strong> {tokenData.EquityDiluted}%</p>
                        <Link to={`/ProductPage/${productData.email}`} className={styles.detailsLink} key={productData.email}>
                            <div className={styles.content}>
                                <div className={styles.logo}>
                                    <img src={productData.images?.[0]} alt="Product Image" className={styles.aboutImage} />
                                </div>
                                <div className={styles.specification}>
                                    <ul className={styles.aboutItems}>
                                        <li className={styles.aboutItem}>
                                            <div className={styles.aboutItemText}>
                                                <h2>{productData.productName}</h2>
                                                <p>{productData.description}</p>
                                                <p><strong>Tags:</strong> {productData.tags?.join(", ")}</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className={styles.bidsSection}>
                        <h2>Bids</h2>
                        <div className={styles.bidsContainer}>
                            
                            {/* Sell Bids Column */}
                            <div className={styles.bidsColumn}>
                                <h3><b>Sell Bids</b></h3>
                                <div className={styles.bidsHeader}>
                                    <span>Price</span>
                                    <span>Quantity</span>
                                </div>
                                {sellBids.length > 0 ? (
                                    sellBids.map((bid, index) => (
                                        <div key={`sell-${index}`} className={styles.bidRow}>
                                            <span className={styles.sellPrice}>{bid.price}</span>
                                            <span>{bid.quantity}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.noBids}>No sell bids available</div>
                                )}
                            </div>


                            {/* Buy Bids Column */}
                            <div className={styles.bidsColumn}>
                                <h3><b>Buy Bids</b></h3>
                                <div className={styles.bidsHeader}>
                                    <span>Price</span>
                                    <span>Quantity</span>
                                </div>
                                {buyBids.length > 0 ? (
                                    buyBids.map((bid, index) => (
                                        <div key={`buy-${index}`} className={styles.bidRow}>
                                            <span className={styles.buyPrice}>{bid.price}</span>
                                            <span>{bid.quantity}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.noBids}>No buy bids available</div>
                                )}
                            </div>
                        </div>
                    </div>




                </div>

                


                {/* User Bids Section - Right */}
                <div className={styles.userBidsSidebar}>
                    <h2>Your Bids</h2>
                   
                    <div className={styles.bidsSection}>
                        <h3>Buy Tickets</h3>
                        {userBuyTickets.length > 0 ? (
                            userBuyTickets.map((ticket, idx) => (
                                <div key={idx} className={styles.ticketItem}>
                                    <div className={styles.ticketInfo}>
                                        <span className={styles.ticketPrice}>${ticket.price}</span>
                                        <span className={styles.ticketQuantity}>Qty: {ticket.quantity}</span>
                                    </div>
                                    <button className={styles.cancelBtn} onClick={() => cancelBuy(ticket)}>
                                        Cancel
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className={styles.noTickets}>No buy tickets</p>
                        )}
                    </div>


                    <div className={styles.bidsSection}>
                        <h3>Sell Tickets</h3>
                        {userSellTickets.length > 0 ? (
                            userSellTickets.map((ticket, idx) => (
                                <div key={idx} className={styles.ticketItem}>
                                    <div className={styles.ticketInfo}>
                                        <span className={styles.ticketPrice}>₹{ticket.price}</span>
                                        <span className={styles.ticketQuantity}>Qty: {ticket.quantity}</span>
                                    </div>
                                    <button className={styles.cancelBtn} onClick={() => cancelSell(ticket)}>
                                        Cancel
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className={styles.noTickets}>No sell tickets</p>
                        )}
                    </div>
                </div>

                
            </div>
        </div>
    );
};


export default TokenPage;

