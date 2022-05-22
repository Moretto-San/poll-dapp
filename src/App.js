import { useState, useEffect } from 'react';
import { ethers, utils, BigNumber } from "ethers";
import abi from "./contracts/Poll.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isPollOwner, setIsPollOwner] = useState(false);
  const [inputValue, setInputValue] = useState({ withdraw: "", deposit: "", pollName: "", newPollItem:"" , pollItem:""});
  const [pollOwnerAddress, setPollOwnerAddress] = useState(null);  
  const [pollItens, setPollItens] = useState(null);  
  const [currentPollName, setCurrentPollName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = '0xAba7976cCE818A18609590E334B0E16C32682e65';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our poll.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getPollName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const pollContract = new ethers.Contract(contractAddress, contractABI, signer);
  
        let pollName = await pollContract.pollName();
        if(pollName){
          pollName = utils.parseBytes32String(pollName);        
          setCurrentPollName(pollName.toString());
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our poll.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const setPollNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const pollContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await pollContract.setPollName(utils.formatBytes32String(inputValue.pollName));
        console.log("Setting Poll Name...");
        await txn.wait();
        console.log("Poll Name Changed", txn.hash);
        await getPollName();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our poll.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const includePollItemHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const pollContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await pollContract.includePollItem(utils.formatBytes32String(inputValue.newPollItem));
        console.log("Including Poll Item...");
        await txn.wait();
        console.log("Poll Item Inserted", txn.hash);
        await getPollItensHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our poll.");
      }
    } catch (error) {
      console.log(error);
    }
  }  

  const getPollOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const pollContract = new ethers.Contract(contractAddress, contractABI, signer);

        let owner = await pollContract.pollOwner();
        setPollOwnerAddress(owner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsPollOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our poll.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getPollItensHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const pollContract = new ethers.Contract(contractAddress, contractABI, signer);

        let itensLength = await pollContract.getPollItemLength();
        console.log("itensLength "+itensLength);

        let concat = "";

        for (let i = 0; i < itensLength; i++) {
          let item = await pollContract.getPollItem(BigNumber.from(i));
          console.log("item "+item);          
          console.log("item "+utils.parseBytes32String(item));
          let votes = await pollContract.getPollItemVotes(BigNumber.from(i));
          console.log("votes "+votes);
          concat = concat+"("+utils.parseBytes32String(item)+" : "+votes+" votes) ";
        }
        
        setPollItens(concat);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our poll.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const voteHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const pollContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await pollContract.voteItem(utils.formatBytes32String(inputValue.pollItem));
        console.log("voting ...");
        await txn.wait();
        console.log("voted", txn.hash);
        await getPollItensHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our poll.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getPollOwnerHandler()
  }, [isWalletConnected])

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Poll Contract Project</span> 📊</h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentPollName === "" && isPollOwner ?
            <p>"Setup the name of your poll." </p> :
            <p className="text-3xl font-bold">{currentPollName}</p>
          }
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Poll itens: </span>{pollItens}</p>
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="pollItem"
              placeholder="Name Of The Poll Item"
              value={inputValue.pollItem}
            />
            <button
              className="btn-purple"
              onClick={voteHandler}>Vote</button>
          </form>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Poll Contract Address: </span>{contractAddress}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Poll Owner Address: </span>{pollOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{customerAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isPollOwner && (
          <section className="poll-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Poll Admin Panel</h2>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="pollName"
                  placeholder="Enter a Name for Your Poll"
                  value={inputValue.pollName}
                />
                <button
                  className="btn-grey"
                  onClick={setPollNameHandler}>
                  Set Poll Name
                </button>
              </form>
            </div>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="newPollItem"
                  placeholder="Enter a New Item for Your Poll"
                  value={inputValue.newPollItem}
                />
                <button
                  className="btn-grey"
                  onClick={includePollItemHandler}>
                  Include Poll Item
                </button>
              </form>
            </div>
          </section>
        )
      }
    </main>
  );
}
export default App;
