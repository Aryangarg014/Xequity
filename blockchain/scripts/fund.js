const { getNamedAccounts, ethers } = require("hardhat")


async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContractAt("FundMe", "0x2E31b851359a2FbA51b6B938724bd021Fe4183C3");

    console.log("Funding Contract")

    const transactionResponse = await fundMe.fund({ value: ethers.parseEther("1") })
    await transactionResponse.wait()
    console.log("Funded successfully!")


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })