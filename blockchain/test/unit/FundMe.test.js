
const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
describe("FundMe", function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.parseEther("1") // ✅ Ethers v6 Fix

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])

        fundMe = await ethers.getContractAt(
            "FundMe",
            (await deployments.get("FundMe")).address,
            await ethers.getSigner(deployer)
        )
        mockV3Aggregator = await ethers.getContractAt(
            "MockV3Aggregator",
            (await deployments.get("MockV3Aggregator")).address,
            await ethers.getSigner(deployer)
        )
    })

    describe("constructor", async function () {
        it("sets the aggregator address correctly", async function () {
            const s_priceFeedAddress = await fundMe.s_priceFeed()
            assert.equal(s_priceFeedAddress, await mockV3Aggregator.getAddress())
        })
    })

    describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })

        it("Updated the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.s_addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })

        it("Add funder to array of s_funders", async function () {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.getFunder(0)  // ✅ Correct function call
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })

        it("Withdraw ETH from a single funder", async function () {
            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target) // ✅ Correct for Ethers v6
            const startingDeployerBalance = await ethers.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = gasUsed * gasPrice

            const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
            const endingDeployerBalance = await ethers.provider.getBalance(deployer)

            // Assert inside the `it` block
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                (startingDeployerBalance + startingFundMeBalance).toString(),  // ✅ BigInt arithmetic
                (endingDeployerBalance + gasCost).toString()
            )
        })

        it("Withdraw ETH from a multliple s_funders", async function () {

            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(accounts[i])

                await fundMeConnectedContract.fund({ value: sendValue })
            }

            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target) // ✅ Correct for Ethers v6
            const startingDeployerBalance = await ethers.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = gasUsed * gasPrice

            const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
            const endingDeployerBalance = await ethers.provider.getBalance(deployer)

            // Assert inside the `it` block
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                (startingDeployerBalance + startingFundMeBalance).toString(),  // ✅ BigInt arithmetic
                (endingDeployerBalance + gasCost).toString()
            )

            //make sure that the s_funders are reset properly

            await expect(fundMe.getFunder(0)).to.be.reverted


            for (i = 1; i < 6; i++) {
                assert.equal(await fundMe.s_addressToAmountFunded(accounts[i].address), 0)
            }
        })

        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)

            await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(
                fundMe, // Contract instance
                "FundMe_NotOwner" // Custom error name
            )
        })



    })
})
