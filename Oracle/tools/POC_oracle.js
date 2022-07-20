const Web3 = require("web3");
const PROVIDER = "http://169.57.44.49:8545";
const ABICODE = require('../contracts/abi/POC.json');
const CONTRACT_ADDRESS = "0x1e40272977D1229744147D54dF1A4b5b6F82eA34";

const web3 = new Web3(
    new Web3.providers.HttpProvider(PROVIDER)
);
const contract = new web3.eth.Contract(ABICODE,CONTRACT_ADDRESS);

class POC_oracle {

    listedForSearchs = async() => {
        console.log("Escuchando nuevas solicitudes...");
        setInterval(async function(){
            let latest_block = await web3.eth.getBlockNumber();
            console.log("Latest Block: ",latest_block);
            let response = await contract.getPastEvents("SearchAdded", { fromBlock: latest_block, toBlock: latest_block });
            console.log("RESPONSE: ",response);
        }, 5000);
    };

}

module.exports = POC_oracle;