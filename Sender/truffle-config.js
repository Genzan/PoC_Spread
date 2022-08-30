const HDWalletProvider = require('@truffle/hdwallet-provider');
const propertiesReader = require('properties-reader');

module.exports = {
  contracts_directory: "./contracts/solidity",
  compilers: { 
    solc: { 
      version: ">=0.4.22 <0.9.0"
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    dicio: {
      provider: () => 
        new HDWalletProvider('http://169.57.44.49:8545'),
        network_id: "*",
        gas: 45000000,
        gasPrice: 0,
        type: "quorum"
    }
  }
};
