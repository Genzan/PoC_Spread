const Web3 = require("web3");
const ipfsClient = require('ipfs-http-client');

const { CONTRACT_ADDRESS, ABICODE, PROVIDER } = require('../resources/env');

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

    getSearchCID = async(_uuid) => {
        console.log("<getSearchCID>");
        let response = await contract.methods.getSearchCID(_uuid).call();
        console.log("</getSearchCID>");
        return response;
    };

    getResults = async(_uuid) => {
        console.log("<getResults>");
        let response = await contract.methods.getResults(_uuid).call();
        console.log("XX: ",response[0].cid);
        //agregar aqui validacion de que no entre si no hay resultados
        const ipfs = new ipfsClient({ host: 'ipfs.infura.io', port: 5001,protocol: 'https' });
        //agregar aqui ciclo que recorra todos los resultados y ademas crear variable q guarde las distancias
        const file = [];
        for await (const item of ipfs.cat(response[0].cid)) {
            console.log("GG",item);
            file.push(item);
            break;
        }
        const raw = Buffer.concat(file).toString();
        console.log("YY: ",JSON.parse(raw));
        // Sacar aqui el promedio.
        console.log("</getResults>");
        return response;
    };

    isOpen = async(_uuid) => {
        console.log("<isOpen>");
        let response = await contract.methods.isOpen(_uuid).call();
        console.log("</isOpen>");
        return response;
    };

}

module.exports = POC;