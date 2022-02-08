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
        console.log('Fetching owned NFTs of ' + configs.owner_address + '...')
        const result = await nftContract.methods
            .tokensOfOwner(configs.owner_address).call();
        console.log(result)
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
