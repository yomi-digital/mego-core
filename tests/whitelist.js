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
            let name = "hamzah-khan"
            let price = 10;
            if (name.length > 5 && name.length <= 10) {
                price = 5;
            } else if (name.length > 10) {
                price = 2;
            }
            let nonce = await web3Instance.eth.getTransactionCount(configs.proxy_address)
            console.log('Adding blacklist ' + name + ' using nonce ' + nonce + '...')
            let result = await nftContract.methods
                .changeAdminLists('0x0000000000000000000000000000000000000000', name, "", 1, false).send({ from: configs.proxy_address, gasPrice: "200000000000", nonce: nonce });
            console.log("Whitelisted! Transaction: " + result.transactionHash);
            nonce = await web3Instance.eth.getTransactionCount(configs.proxy_address)
            console.log('Registering name ' + name + ' using nonce ' + nonce + '...')
            result = await nftContract.methods.mintName(name, 'dao').send({ from: configs.proxy_address, value: price.toString() + "000000000000000000", gasPrice: "200000000000", nonce: nonce });
            console.log("Minted! Transaction: " + result.transactionHash);
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