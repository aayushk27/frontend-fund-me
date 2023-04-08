import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

console.log(ethers);

async function connect() {
	if (typeof window.ethereum !== "undefined") {
		await window.ethereum.request({
			method: "eth_requestAccounts",
		});
		connectButton.innerHTML = "Connected!";
		document.getElementById("connected").innerHTML =
			"Successfully Connected to the Wallet!";
	} else {
		connectButton.innerHTML = "Please Install Metamask!";
	}
}

async function getBalance() {
	if (typeof window.ethereum !== "undefined") {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const balance = await provider.getBalance(contractAddress);
		console.log(ethers.utils.formatEther(balance));
		document.getElementById(
			"balanceAmt"
		).innerHTML = `Balance is ${ethers.utils.formatEther(balance)}ETH`;
	} else {
		balanceButton.innerHTML = "Please Install Metamask!";
	}
}

async function withdraw() {
	console.log("Withdrawing...");
	if (typeof window.ethereum !== "undefined") {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const contract = new ethers.Contract(contractAddress, abi, signer);
		try {
			const txResponse = await contract.withdraw();
			await listenForTransactionMine(txResponse, provider);
			document.getElementById("withdrawnAmt").innerHTML = `Withdrawn!!`;
		} catch (error) {
			console.log(error);
		}
	} else {
		withdrawButton.innerHTML = "Please Install Metamask!";
	}
}

async function fund() {
	const ethAmount = document.getElementById("ethAmount").value;
	console.log(`Funding with ${ethAmount}...`);
	if (typeof window.ethereum !== "undefined") {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const contract = new ethers.Contract(contractAddress, abi, signer);
		try {
			const txResponse = await contract.fund({
				value: ethers.utils.parseEther(ethAmount),
			});
			await listenForTransactionMine(txResponse, provider);
			console.log("Done!");
			document.getElementById(
				"fundedAmt"
			).innerHTML = `Funded ${ethAmount}ETH`;
		} catch (error) {
			console.log(error);
		}
	} else {
		fundButton.innerHTML = "Please install MetaMask";
	}
}

function listenForTransactionMine(txResponse, provider) {
	console.log(`Mining ${txResponse.hash}...`);

	return new Promise((resolve, reject) => {
		try {
			provider.once(txResponse.hash, (transactionReceipt) => {
				console.log(
					`Completed with ${transactionReceipt.confirmations} confirmations.`
				);
				resolve();
			});
		} catch (error) {
			reject(error);
		}
	});
}
