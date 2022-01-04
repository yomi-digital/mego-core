const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const MNEMONIC = process.env.GANACHE_MNEMONIC;
const NFT_CONTRACT_ADDRESS = process.env.GANACHE_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.GANACHE_OWNER_ADDRESS;
const NFT_CONTRACT_ABI = require('../abi.json')
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs')
const CsvReadableStream = require('csv-reader')

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
        let names = []
        let inputStream = fs.createReadStream('./blacklists/friends.csv', 'utf8');
        inputStream
            .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {
                let name = row[0].toLowerCase().trim().replace(/\s/g, "-")
                console.log('Adding name: ' + name)
                names.push(name)
            })
            .on('end', async function () {
                console.log('No more rows, start blacklisting!');
                for (let k in names) {
                    const name = names[k]
                    try {
                        const nonce = await web3Instance.eth.getTransactionCount(configs.proxy_address)
                        console.log('Adding blacklist ' + name + ' using nonce ' + nonce + '...')
                        const result = await nftContract.methods
                            .changeAdminLists('0x0000000000000000000000000000000000000000', name, "", 1, true).send({ from: configs.proxy_address, gasPrice: "50000000000", nonce: nonce });
                        console.log("Blacklisted! Transaction: " + result.transactionHash);
                    } catch (e) {
                        console.log(e.message)
                    }
                }
                console.log('Blacklist finished!')
            });
    } else {
        console.log('Please provide `owner_mnemonic` first.')
    }

}

if (argv._ !== undefined) {
    main();
} else {
    console.log('Provide a deployed contract first.')
}