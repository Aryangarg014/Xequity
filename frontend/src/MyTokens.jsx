import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './VirtualAssets.module.css';




const MyTokens = ({ userEmail }) => {
  const { email } = useParams();
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();




  useEffect(() => {
    const fetchTokens = async () => {
      if (!email) {
        console.log('No email provided, skipping token fetch');
        return;
      }


      setError('');


      try {
        const response = await axios.get(`http://localhost:3001/api/my-investments/${email}`);
        const userTokens = response.data.tokens || [];
        console.log('User tokens:', userTokens);
        setTokens(userTokens);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError('Failed to fetch tokens');
      }
    };




    fetchTokens();
  }, [email]);




  const handleCardClick = (tokenEmail) => {
    if (tokenEmail) {
      navigate(`/TokenPage/${tokenEmail}`, {
        state: { userEmail: email },
      });
    }
  };




  return (
    <div className={styles.virtualAssetsPage}>
      <main className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Investments</h1>
          <p className={styles.pageSubtitle}>
            Your investment portfolio on the Xquity Exchange.
          </p>
        </header>


        {error && (
          <div style={{
            textAlign: 'center',
            color: '#dc3545',
            padding: '1rem',
            backgroundColor: '#f8d7da',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}




        <section>
          <div className={styles.assetsGrid}>
            {tokens.length > 0 ? (
              tokens.map((token, index) => (
                <div
                  key={index}
                  className={styles.assetCard}
                  onClick={() => handleCardClick(token.tokenmail)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${token.tokenname}`}
                >
                  <div className={styles.assetImageContainer}>
                    <img
                      src={token.image || '/default-token-image.png'}
                      alt={token.tokenname}
                      className={styles.assetImage}
                      onError={(e) => {
                        e.target.src = '/default-token-image.png';
                      }}
                    />
                  </div>
                  <div className={styles.assetContent}>
                    <div className={styles.assetInfo}>
                      <h2 className={styles.assetName}>{token.tokenname}</h2>
                    </div>
                    <div className={styles.assetPriceSection}>
                      <span className={styles.priceLabel}>Market Price</span>
                      <span className={styles.priceValue}>
                        ₹{token.currentPrice || 'N/A'}
                      </span>
                    </div>
                    <div className={styles.assetPriceSection}>
                      <span className={styles.priceLabel}>Quantity</span>
                      <span className={styles.priceValue}>
                        {token.quantity}
                      </span>
                    </div>
                    <div className={styles.assetPriceSection}>
                      <span className={styles.priceLabel}>Avg Price</span>
                      <span className={styles.priceValue}>
                        ₹{token.avgprice}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💼</div>
                <div className={styles.emptyTitle}>No Tokens Found</div>
                <div className={styles.emptyDescription}>
                  You don't own any external tokens yet. Start investing in virtual assets to see them here.
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
export default MyTokens;


