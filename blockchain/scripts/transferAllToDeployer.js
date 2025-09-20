const { ethers } = require("hardhat")
require('dotenv').config()

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545")
    const deployerAddress = process.env.DEPLOYER_ADDRESS

    if (!deployerAddress) {
        console.error("Deployer address not found in environment variables!")
        return
    }

    // Get private keys from environment variables
    const privateKeys = [
        process.env.DEPLOYER_KEY,
        process.env.PRIVATE_KEY_1,
        process.env.PRIVATE_KEY_2,
        process.env.PRIVATE_KEY_3,
        process.env.PRIVATE_KEY_4,
        process.env.PRIVATE_KEY_5,
        process.env.PRIVATE_KEY_6,
        process.env.PRIVATE_KEY_7,
        process.env.PRIVATE_KEY_8,
        process.env.PRIVATE_KEY_9,
    ].filter(key => key) // Filter out any undefined keys

    if (privateKeys.length === 0) {
        console.error("No private keys found in environment variables!")
        return
    }

    for (const key of privateKeys) {
        try {
            const wallet = new ethers.Wallet(key, provider)

            const balance = await provider.getBalance(wallet.address)
            const gasPrice = (await provider.getFeeData()).gasPrice
            const gasLimit = 21000n
            const fee = gasPrice * gasLimit
            const amount = balance - fee

            if (amount > 0n) {
                console.log(`🔁 Sending from ${wallet.address} → ${deployerAddress}`)
                const tx = await wallet.sendTransaction({
                    to: deployerAddress,
                    value: amount,
                    gasLimit,
                })
                await tx.wait()
                console.log(`✅ Sent ${ethers.formatEther(amount)} ETH`)
            } else {
                console.log(`⚠️ Not enough balance in ${wallet.address}`)
            }
        } catch (error) {
            console.error(`Error processing wallet: ${error.message}`)
        }
    }
}

main().catch(console.error)