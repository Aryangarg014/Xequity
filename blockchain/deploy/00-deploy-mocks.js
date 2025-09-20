const { network, getNamedAccounts, deployments } = require("hardhat")
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    console.log("Current network:", network.name) // Debugging

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")

        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator", // ✅ Correct key name
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })

        log("Mocks deployed!!")
        log("_________________________________________")
    }
}

module.exports.tags = ["all", "mocks"]
