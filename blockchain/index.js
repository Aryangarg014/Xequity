import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress, recipientAddresses } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
const recipientSelect = document.getElementById("recipientSelect");

// Populate the recipient dropdown
recipientAddresses.forEach((address) => {
    const option = document.createElement("option");
    option.value = address;
    option.innerText = address;
    recipientSelect.appendChild(option);
});

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
document.getElementById("contractAddress").innerText = contractAddress;

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("I see a MetaMask!");
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        document.getElementById("accountAddress").innerText = accounts[0];
        connectButton.innerHTML = "Connected!";
    } else {
        connectButton.innerHTML = "Please install MetaMask";
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    const recipient = recipientSelect.value; // Get selected recipient address

    console.log(`Funding ${recipient} with ${ethAmount} ETH...`);

    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        try {
            const transactionResponse = await signer.sendTransaction({
                to: recipient,
                value: ethers.utils.parseEther(ethAmount),
            });

            await listenForTransaction(transactionResponse, provider);
            console.log(`Transaction sent to ${recipient}`);
        } catch (error) {
            console.error(error);
        }
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function withdraw() {
    const recipient = recipientSelect.value; // Get the selected recipient

    if (typeof window.ethereum !== "undefined") {
        console.log(`Withdrawing to ${recipient}...`);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        try {
            const transactionResponse = await contract.withdraw({ to: recipient });
            await listenForTransaction(transactionResponse, provider);
            console.log(`Funds withdrawn to ${recipient}`);
        } catch (error) {
            console.log(error);
        }
    }
}


function listenForTransaction(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(`Completed with ${transactionReceipt.confirmations} confirmations`);
            resolve();
        });
    });
}
