const Web3 = require("web3");
const axios = require('axios');
const ipfsClient = require('ipfs-http-client');

const FormData = require('form-data');
const fs = require('fs');

const { CONTRACT_ADDRESS, ABICODE, PROVIDER, ADDRESS, PRIVATE_KEY } = require('../resources/env');

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
            let responseEvent = await contract.getPastEvents("SearchAdded", { fromBlock: latest_block, toBlock: latest_block });
            console.log("RESPONSE: ",responseEvent);
            if (responseEvent.length !== 0) {
                let data = new FormData();
                data.append('curp', responseEvent[0].returnValues._curp);
                data.append('imageQuery', fs.createReadStream('/Users/aescuderoc/Downloads/Alan.jpg'));

                let config = {
                method: 'post',
                url: 'http://110.238.81.123:8000/v1/dev_workflows/webhook/all-check-alliance',
                headers: { 
                    'apikey': '8rQjNygyyhMAK5p6Ya2jBbkoIbQL9IM7', 
                    'host': '110.238.81.123', 
                    ...data.getHeaders()
                },
                data : data
                };
                axios(config)
                .then(async function (responseAxios) {
                    console.log(JSON.stringify(responseAxios.data));
                    const ipfs = new ipfsClient({ host: 'ipfs.infura.io', port: 5001,protocol: 'https' });
                    const object  = await ipfs.add(JSON.stringify(responseAxios.data));
                    let cid = "";
                    for await (const item of object) {
                        cid = item;
                        break;
                    }
                    let encodedABI = contract.methods.newResult(responseEvent[0].returnValues._uuid, true, cid).encodeABI();
                    let signedTx = await web3.eth.accounts.signTransaction(
                        {
                        data: encodedABI,
                        from: ADDRESS,
                        gas: 2000000,
                        to: CONTRACT_ADDRESS,
                        },
                        PRIVATE_KEY,
                        false,
                    );
                    let responseTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction).catch((err) => {
                        console.error("ERR",err);
                    });
                    const blockNumber = responseTx.blockNumber;
                    let response2 = await contract.getPastEvents("ResultAdded", { fromBlock: blockNumber, toBlock: blockNumber });
                    for(var i=0; i < response2.length; i++){
                        if(response2[i].transactionHash === responseTx.transactionHash) {
                            let endresult = {
                                "uuid": response2[i].returnValues._uuid,
                                "node": response2[i].returnValues._node,
                            }
                            console.log("END_RESULT: ",endresult);
                        }
                    }
                })
                .catch(function (error) {
                console.log(error);
                });
            }
        }, 5000);
    };

}

module.exports = POC_oracle;