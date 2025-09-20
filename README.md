# Xequity - Token-Based Fundraising Platform

**MERN Stack + Blockchain Application**

Xequity is a token-based fundraising platform for startups that preserves equity control. Built with MongoDB, Express, React, Node.js, and Ethereum smart contracts, it allows startups to raise funds through tokens while maintaining their equity ownership structure.

## � Key Features

### Core Functionality
- **Token-Based Fundraising**: Startups can raise funds through blockchain tokens while maintaining equity control
- **Role-Based Authentication**: Secure login system with different roles (Investor, Startup, Admin)
- **Dynamic Routing**: Modular architecture with React Router for seamless navigation
- **Asset Tracking**: Real-time tracking of token performance and investments
- **Profile Management**: Comprehensive user and admin dashboards

### For Users
- **Investor Dashboard**: Browse startups, purchase tokens, track investments
- **Startup Dashboard**: Create profiles, issue tokens, manage fundraising campaigns
- **Admin Panel**: Monitor platform activity, user management, and system oversight
- **Secure Transactions**: Blockchain-powered secure token purchases and transfers

## Tech Stack

**MERN Stack + Blockchain**
- **Frontend**: React.js with Vite
- **Backend**: Node.js + Express.js REST API  
- **Database**: MongoDB with Mongoose ODM
- **Blockchain**: Ethereum Smart Contracts (Solidity), Ganache for local testing
- **Tools**: Hardhat for development, MetaMask integration



## � Installation & Setup

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** and **MongoDB Compass** (local installation)
- **Ganache** (for local blockchain testing)
- **MetaMask** browser extension
- **Git**

### Step 1: Clone Repository
```bash
git clone https://github.com/Aryangarg014/Xequity.git
cd Xequity
```

### Step 2: Setup Ganache & Blockchain
1. **Install Ganache**: Download from [Ganache Official Site](https://trufflesuite.com/ganache/)
2. **Start Ganache**: Create a new workspace with default settings
3. **Setup Blockchain**:
```bash
cd blockchain
npm install
```
4. **Create `.env` file in blockchain folder**:
```env
# Get private key from Ganache (click on key icon next to any account)
PRIVATE_KEY=0x1234...your_ganache_private_key_here
```
5. **Compile Smart Contracts**:
```bash
# Compile contracts
npm run compile
```

### Step 3: Setup MongoDB & Server
1. **Start MongoDB** using MongoDB Compass (local installation)
2. **Setup Server**:
```bash
cd ../server
npm install
```
3. **Create `.env` file in server folder**:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/Xequity

# Email Configuration (for OTP)
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password
```
4. **Start Server**:
```bash
npm start
```

### Step 4: Setup Frontend
```bash
cd ../frontend
npm install

# Start development server
npm run dev
```

### Step 5: Setup MetaMask
1. **Add Ganache Network** to MetaMask:
   - Network Name: `Ganache Local`
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337`
   - Currency: `ETH`

2. **Import Account**: Import one of the Ganache accounts using its private key

### 🔧 Important Configuration Notes:

**Getting Ganache Private Key:**
- Open Ganache → Click the key icon next to any account → Copy private key

**Email App Password (Gmail):**
- Enable 2FA on Gmail → Go to App Passwords → Generate new password → Use this in EMAIL_PASS

**MongoDB Setup:**
- Install MongoDB Community Server and MongoDB Compass
- Start MongoDB service (usually starts automatically after installation)
- In Compass, connect using: `mongodb://localhost:27017`
- Database "Xequity" will be created automatically when server runs

**Access the Application:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Ganache: `http://127.0.0.1:7545`

## � How to Use

### For Investors
1. **Register** → Select "Investor" role during signup
2. **Browse Startups** → Explore available fundraising campaigns
3. **Purchase Tokens** → Buy tokens using MetaMask and Ganache ETH
4. **Track Portfolio** → Monitor your investments in the dashboard

### For Startups
1. **Register** → Select "Startup" role during signup
2. **Create Profile** → Add company details and products
3. **Issue Tokens** → Launch fundraising campaigns
4. **Manage Funds** → Track raised funds and investor activity

### For Admins
1. **Admin Dashboard** → Monitor all platform activity
2. **User Management** → Oversee investor and startup accounts
3. **System Analytics** → Track token performance and transactions

## � Project Architecture

### Modular Design
- **Role-Based Authentication**: Separate interfaces for Investors, Startups, and Admins
- **Dynamic Routing**: React Router for seamless navigation between dashboards
- **Secure API**: Session-based authentication with protected routes
- **Real-Time Updates**: Live token tracking and portfolio management

### Smart Contract Features
- **FundMe.sol**: Handles fundraising and token purchases
- **PriceConverter.sol**: ETH/USD price conversion using oracles
- **Secure Transactions**: Owner-only functions and validation checks

## 🛠️ Testing the Application

### Test Smart Contracts
```bash
cd blockchain
npm test
```

### Test the Full Application
1. **Start Ganache** → Ensure local blockchain is running on port 7545
2. **Compile Contracts** → Smart contracts ready for testing
3. **Start MongoDB** → Use MongoDB Compass to connect locally
4. **Run Server** → Backend API should be active on `http://localhost:3001`
5. **Launch Frontend** → Access via `http://localhost:5173`
6. **Connect MetaMask** → Use Ganache network and accounts

## 🔐 Security Features

- **Role-Based Access Control**: Separate authentication for different user types
- **Session Management**: Secure user authentication and authorization
- **Smart Contract Security**: Owner-only functions and validation
- **Input Validation**: Server-side validation for all operations
- **Blockchain Security**: Immutable transaction records

---

Built with MERN Stack + Blockchain technology for decentralized fundraising.