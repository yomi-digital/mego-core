const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const MNEMONIC = process.env.GANACHE_MNEMONIC;
const NFT_CONTRACT_ADDRESS = process.env.GANACHE_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.GANACHE_OWNER_ADDRESS;
const NFT_CONTRACT_ABI = require('../abi.json')
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs')

async function main() {
    const configs = JSON.parse(fs.readFileSync('./configs/' + argv._ + '.json').toString())
    if (configs.owner_mnemonic !== undefined) {
        const provider = new HDWalletProvider(
            configs.owner_mnemonic,
            configs.provider
        );
        const web3Instance = new web3(provider);

        const nftContract = new web3Instance.eth.Contract(
            NFT_CONTRACT_ABI,
            configs.contract_address, { gasLimit: "5000000" }
        );

        try {
            console.log('Trying whitelist...')
            let address = "0x4A564813f86f9d8aeC34D45c7750c4686c2f77FB"
            let tokenId = 260;
            let nonce = await web3Instance.eth.getTransactionCount(configs.proxy_address)
            console.log('Transferring ' + tokenId + ' using nonce ' + nonce + '...')
            let result = await nftContract.methods
                .safeTransferFrom(configs.proxy_address, address, tokenId).send({ from: configs.proxy_address, gasPrice: "200000000000", nonce: nonce });
            console.log("Sent! Transaction: " + result.transactionHash);
            console.log(result)
        } catch (e) {
            console.log(e.message)
        }
    } else {
        console.log('Please provide `owner_mnemonic` first.')
    }

}

if (argv._ !== undefined) {
    main();
} else {
    console.log('Provide a deployed contract first.')
}