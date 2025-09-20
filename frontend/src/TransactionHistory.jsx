// TransactionHistory.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './TransactionHistory.css';

const TransactionHistory = () => {
  const { email } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/transaction-history/${email}`);
        const history = response.data?.transactions || [];
        setTransactions(history.reverse()); // Most recent first
      } catch (err) {
        setError('Failed to fetch transaction history');
        console.error(err);
      }
    };
    fetchHistory();
  }, [email]);
  {console.log(email)};
  return (
    <div className="history-container">
      <h1>Transaction History</h1>
      {error && <p className="error-message">{error}</p>}
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="history-list">
          {transactions.map((tx, idx) => (
  <div className="transaction-card" key={idx}>
    <div className="transaction-left">
      <div className="transaction-title">{tx.productName}</div>
      <div className="transaction-time">{new Date(tx.createdAt).toLocaleString()}</div>
      <div className={`transaction-type ${tx.transactiontype === 'buy' ? 'buy' : 'sell'}`}>
        {tx.transactiontype.toUpperCase()}
      </div>
    </div>

    <div className="transaction-right">
      <div className="transaction-details">Qty: {tx.quantity}</div>
      <div className="transaction-details">Avg Price: ₹{tx.price}</div>
      <div className="transaction-details">Total: ₹{(tx.price * tx.quantity).toFixed(2)}</div>
    </div>
  </div>
))}

        </div>
      )}
    </div>
  );
};

export default TransactionHistory;