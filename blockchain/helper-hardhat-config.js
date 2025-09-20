const networkConfig = {
    4: {
        name: "rinkeby", // Fixed typo from "rikeby"
        ethUsdPriceFeed: "",
    },
    1337: {
        name: "ganache",
        ethUsdPriceFeed: "0x939cc7Ae783a56eD73c770FcB31C1CeE8D94D079", // Add price feed address if needed
    },
}

const { network } = require("hardhat")
const DECIMALS = 8
const INITIAL_ANSWER = 20000000000

const developmentChains = ["hardhat", "localhost", "ganache"] // Added ganache

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}
