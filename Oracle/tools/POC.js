const Web3 = require("web3");
const PROVIDER = "http://169.57.44.49:8545";
const ABICODE = require('../contracts/abi/POC.json');
const CONTRACT_ADDRESS = "0x1e40272977D1229744147D54dF1A4b5b6F82eA34";

const web3 = new Web3(
    new Web3.providers.HttpProvider(PROVIDER)
);
const contract = new web3.eth.Contract(ABICODE,CONTRACT_ADDRESS);

class POC {

    addBusqueda = async(_address, _privateKey, _uuid, _curp, _cid) => {
        console.log("<addBusqueda>");
        let result = false;
        let encodedABI = contract.methods.newSearch(_uuid, _curp, _cid).encodeABI();
        let signedTx = await web3.eth.accounts.signTransaction(
            {
              data: encodedABI,
              from: _address,
              gas: 2000000,
              to: CONTRACT_ADDRESS,
            },
            _privateKey,
            false,
        );
        let response = await web3.eth.sendSignedTransaction(signedTx.rawTransaction).catch((err) => {
            console.error("ERR_11",err);
        });
        const blockNumber = response.blockNumber;
        let response2 = await contract.getPastEvents("SearchAdded", { fromBlock: blockNumber, toBlock: blockNumber });
        for(var i=0; i < response2.length; i++) {
            if(response2[i].transactionHash === response.transactionHash) {
                result = {
                    "uuid": response2[i].returnValues._uuid,
                    "curp": response2[i].returnValues._curp,
                    "cid": response2[i].returnValues._cid,
                }
            }
        }
        let count = 0;
        setInterval(async function(){
            let isReady = await contract.methods.isOpen(_uuid).call();
            console.log('loop '+count+":",isReady);
            count++;
            if (!isReady) {
                console.log("</addBusqueda>");
                return result;
                // Añadir aqui que se corte despues de ciertos minutos
            }
        }, 5000);
        
    };

    listedForSearchs = async() => {
        console.log("<listedForSearchs>");
        const options = {
            filter: {
                value: [],
            },
            fromBlock: 0
        };
        contract.events.SearchAdded(options)
            .on('data', event => console.log(event))
            .on('changed', changed => console.log(changed));
        console.log("</listedForSearchs>");
        //return response;
    };

}

module.exports = POC;