import { useState, useEffect } from "react";
import { ethers } from "ethers";
import erc20abi from "./ERC20abi.json";

export default function App() {
  const [txs, setTxs] = useState([]);
  const [contractListened, setContractListened] = useState();
  const [error, setError] = useState();
  //used for getting the info of token
  const [contractInfo, setContractInfo] = useState({
    address: "-",
    tokenName: "-",
    tokenSymbol: "-",
    totalSupply: "-"
  });
/*basically we use the use effect to run the function again once the 
dependancies have changed */
useEffect(() => {
    if (contractInfo.address !== "-") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc20 = new ethers.Contract( contractInfo.address,erc20abi,provider);
      erc20.on("Transfer", (from, to, amount, event) => {
        console.log({ from, to, amount, event });

        setTxs((currentTxs) => [
          ...currentTxs,
          { txHash: event.transactionHash ,from,to, amount: String(amount)}]
        );
      });
      setContractListened(erc20);

      return () => {
        contractListened.removeAllListeners();
      };
    }
  }, [contractInfo.address]);

  // it is used when we click the button "get token info"
  const handleSubmit = async (e) => {
    e.preventDefault();
    //to get the data of the box
    const data = new FormData(e.target);
    //we use a windows.eth because metamask injects it from the browser as it is an API provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // creating new instance of that provider or smart contract
    //parameters are address of contarct, ABI , provider
    //we are taking the provider that is exposed from meta-mask
    const erc20 = new ethers.Contract(data.get("addr"), erc20abi, provider);
    // as we have created the instance of smart contart we can call the functions of it
    //and these functions are returning the promise so we are awaiting them by using await
    const tokenName = await erc20.name();
    const tokenSymbol = await erc20.symbol();
    const totalSupply = await erc20.totalSupply();
    //storing the info in the regular usestate of contract info
    //all the values are being fetched from the above variables
    setContractInfo({
      address: data.get("addr"),
      tokenName,
      tokenSymbol,
      totalSupply
    });
  };

  // it is used for transfering tokens button 
  const handleTransfer = async (e) => {
    //preventing the default transaction
    e.preventDefault();
    //taking the data entered in the box
    const data = new FormData(e.target);
    //creating a provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //fetching inf about currently used account
    await provider.send("eth_requestAccounts", []);
    /* the getsigner is used to represent the particular etherium account for 
    using diff functionalities getting the address of contract*/ 
    const signer = await provider.getSigner();
    //taking the address of the smartcontract , ABI and account user (like metamask account)
    const erc20 = new ethers.Contract(contractInfo.address, erc20abi, signer);
    /*getting recipeint data and transffering the amount to recipient 
    by knowing the balance of the metamask user*/
    await erc20.transfer(data.get("recipient"), data.get("amount"));
  };

  return (
    <div>  
        <form onSubmit={handleSubmit}>
            
                  <main>
                      <h1> Enter Address of Smart contract </h1>       
                      <div>
                      <input type="text" name="addr" placeholder="ERC20 contract address"/>
                      </div>             
                    </main>
                    <footer>
                        <button type="submit"> Get token infon</button>
                    </footer>
                <div>
                       <table>
                           <thead>
                              <tr>
                                <th>Name</th>
                                <th>Symbol</th>
                                <th>Total supply</th>
                                </tr>
                             </thead>
                              <tbody>
                                   <tr>
                                      <th>{contractInfo.tokenName}</th>
                                      <td>{contractInfo.tokenSymbol}</td>
                                      <td>{String(contractInfo.totalSupply)}</td>
                                      <td>{contractInfo.deployedAt}</td>
                                     </tr>
                                </tbody>
                         </table>
                 </div>                
          </form>
         
       <h1> Transfer tokens </h1>
            <form onSubmit={handleTransfer}>
                    <div>
                         <input type="text" name="recipient" placeholder="Recipient address"/>
                     </div>
                     <div>
                         <input type="text" name="amount" placeholder="Amount to transfer" />
                     </div>
                <footer>
                  <button type="submit"> Send </button>
                 </footer>
             </form>                        
     </div>
  );
}
