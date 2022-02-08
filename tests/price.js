const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const NFT_CONTRACT_ABI = require('../abi.json')
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs')

async function main() {
    const configs = JSON.parse(fs.readFileSync('./configs/' + argv._ + '.json').toString())
    const provider = new HDWalletProvider(
        configs.proxy_mnemonic,
        configs.provider
    );
    const web3Instance = new web3(provider);

    const nftContract = new web3Instance.eth.Contract(
        NFT_CONTRACT_ABI,
        configs.contract_address,
        { gasLimit: "5000000" }
    );

    try {
        console.log('Trying adjusting sell price...')
        await nftContract.methods
            .fixPrice(3, "100000000000000")
            .send({ from: configs.proxy_address });
        await nftContract.methods
            .fixPrice(2, "100000000000000")
            .send({ from: configs.proxy_address });
        await nftContract.methods
            .fixPrice(1, "100000000000000")
            .send({ from: configs.proxy_address });
        console.log("Fixed!");
        process.exit()
    } catch (e) {
        console.log(e)
        process.exit()
    }

}

if (argv._ !== undefined) {
    main();
} else {
    console.log('Provide a configs contract first.')
}
