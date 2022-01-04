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
            console.log('Trying add...')
            await nftContract.methods
                .changeAdminLists('0x0000000000000000000000000000000000000000', "dao", "", 2, true).send({ from: configs.proxy_address, gasPrice: "100000000000" });
            await nftContract.methods
                .changeAdminLists('0x0000000000000000000000000000000000000000', "dao", "Ibiza Identity NFT", 4, true).send({ from: configs.proxy_address, gasPrice: "100000000000" });
            console.log('Description added')
            await nftContract.methods
                .changeAdminLists('0x0000000000000000000000000000000000000000', "dao", '<path d="m 207.648,78.591767 c -4.833,-2.8481 -11.115,-2.8481 -16.43,0 l -37.694,21.835503 -25.612,14.2408 -37.693,21.835 c -4.8325,2.848 -11.1147,2.848 -16.4304,0 l -29.9613,-17.089 c -4.8325,-2.848 -8.2152,-8.069 -8.2152,-13.7653 V 71.946167 c 0,-5.696201 2.8995,-10.9177 8.2152,-13.7658 l 29.478,-16.6139 c 4.8325,-2.8481 11.1147,-2.8481 16.4304,0 l 29.4783,16.6139 c 4.832,2.8481 8.215,8.069599 8.215,13.7658 V 93.781666 L 153.041,79.066467 V 57.231066 c 0,-5.696299 -2.899,-10.9178 -8.215,-13.7659 L 90.219,12.136077 c -4.8325,-2.8481025 -11.1147,-2.8481025 -16.4304,0 L 18.2152,43.465166 C 12.89948,46.313266 10,51.534767 10,57.231066 v 63.133004 c 0,5.696 2.89948,10.918 8.2152,13.766 l 55.5734,31.329 c 4.8324,2.848 11.1147,2.848 16.4304,0 l 37.693,-21.361 25.612,-14.715 37.694,-21.3609 c 4.832,-2.8481 11.114,-2.8481 16.43,0 l 29.478,16.6139 c 4.832,2.848 8.215,8.07 8.215,13.766 v 33.702 c 0,5.697 -2.899,10.918 -8.215,13.766 l -29.478,17.089 c -4.833,2.848 -11.115,2.848 -16.43,0 l -29.478,-16.614 c -4.833,-2.848 -8.216,-8.07 -8.216,-13.766 v -21.835 l -25.612,14.715 v 21.835 c 0,5.696 2.9,10.918 8.215,13.766 l 55.574,31.329 c 4.832,2.848 11.114,2.848 16.43,0 l 55.574,-31.329 c 4.832,-2.848 8.215,-8.07 8.215,-13.766 v -63.133 c 0,-5.696 -2.9,-10.917 -8.215,-13.765 z" x="10" y="10" style="fill:#ffffff;fill-opacity:1;x:60;y:20" />', 3, true).send({ from: configs.proxy_address, gasPrice: "100000000000" })
            console.log('Added logo')
            process.exit()
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