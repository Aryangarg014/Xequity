require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-deploy");
require("hardhat-deploy-ethers");

module.exports = {
  defaultNetwork: "ganache",
  solidity: "0.8.20",

  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      chainId: 1337,
      accounts: [
        "0x57a1369c963efa94b681ef53d09fb9dca21ecf8bf46bdeaf3321e234fd6b26bc",
      ],
    },
  },
  paths: {
    sources: "./contracts", // Ensure contracts are inside blockchain/contracts
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  namedAccounts: {
    deployer: {
      default: 0, // Index 0 from accounts
    },
  },
};

