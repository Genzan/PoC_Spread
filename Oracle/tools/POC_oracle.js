const Web3 = require("web3");
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const { CONTRACT_ADDRESS, ABICODE, PROVIDER } = require('../resources/env');

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
            if (response.length !== 0) {
                //console.log("XXX",response[0].returnValues._curp);
                let data = new FormData();
                data.append('curp', response[0].returnValues._curp);
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
                .then(function (response) {
                console.log(JSON.stringify(response.data));
                })
                .catch(function (error) {
                console.log(error);
                });
            }
        }, 5000);
    };

}

module.exports = POC_oracle;