import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GainEquity.css';


const GainEquity = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState(null);
  const [coinsToReturn, setCoinsToReturn] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentCoin, SetCurrentCoin] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    // '/api/usertokens:tokenmail'
    const fetchTokenData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/virtualtokens/${email}`);
        // console.log(response.data)
        setTokenData({
          TokenName: response.data.TokenName,
          TokenEmail: response.data.email,
          email: response.data.email,
          NumberOfIssue: parseFloat(response.data.NumberOfIssue).toFixed(8),
          EquityDiluted: parseFloat(response.data.EquityDiluted).toFixed(4)
        });
        const response1 = await axios.get(`http://localhost:3001/api/usertokens/${email}`);
        SetCurrentCoin(response1.data.Quantity);
      } catch (err) {
        setError('Failed to fetch token data');
        console.error('Error fetching token data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTokenData();
  }, [email]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coinsToReturn || isNaN(coinsToReturn)) {
      setError('Please enter a valid number of coins');
      return;
    }


    const coinsNum = parseFloat(coinsToReturn);
    if (coinsNum <= 0) {
      setError('Number of tokens must be positive');
      return;
    }
    const AvailableCoin = parseFloat(currentCoin) - parseFloat(coinsToReturn);
    if (coinsNum > AvailableCoin) {
      setError('Number of tokens must not be greater than Available tokens');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/api/gain-equity', {
        email, // investor
        tokenEmail: tokenData.email, // company
        tokenName: tokenData.TokenName,
        quantity: coinsNum
      });


      alert(response.data.message);
      navigate(`/company/${tokenData.email}`);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to gain equity';
      setError(errMsg);
      console.error('Gain equity error:', errMsg);
    }
  };


  if (loading) return <div className="loading">Loading token data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!tokenData) return <div className="error">No token data found</div>;


  return (
    <div className="gain-equity-container">
      <h2>Gain Equity in {tokenData.TokenName}</h2>


      <div className="token-info">
        <p><strong>Current Price:</strong> {tokenData.CurrentPrice}</p>
        <p><strong>Current Equity Diluted:</strong> {tokenData.EquityDiluted}%</p>
        <p><strong>Coins Available:</strong> {tokenData.NumberOfIssue}</p>
        <p><strong>Token Owner (Company):</strong> {tokenData.email}</p>
      </div>


      <form onSubmit={handleSubmit} className="equity-form">
        <div className="form-group">
          <label htmlFor="coins">Number of Coins to Return:</label>
          <input
            type="number"
            id="coins"
            value={coinsToReturn}
            onChange={(e) => setCoinsToReturn(e.target.value)}
            min="0"
            step="0.00000001"
            required
          />
        </div>


        <div className="form-group">
          <p><strong>New Equity Diluted After Return:</strong>
            {coinsToReturn ?
              ` ${(parseFloat(tokenData.EquityDiluted) -
                (parseFloat(tokenData.EquityDiluted) / parseFloat(tokenData.NumberOfIssue)) * parseFloat(coinsToReturn)
              ).toFixed(4)}%` : ' Enter coins to calculate'}
          </p>
          <p><strong>Remaining Coins:</strong>
            {coinsToReturn ?
              ` ${(parseFloat(currentCoin) - parseFloat(coinsToReturn)).toFixed(8)}` :
              currentCoin}
          </p>
        </div>


        {error && <div className="error-message">{error}</div>}


        <button type="submit" className="submit-btn">Gain Equity</button>
      </form>
    </div>
  );
};


export default GainEquity;





