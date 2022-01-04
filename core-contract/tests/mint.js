const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const NFT_CONTRACT_ABI = require('../abi.json')
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs')

function randomName(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

async function main() {
    const configs = JSON.parse(fs.readFileSync('./configs/' + argv._ + '.json').toString())
    const provider = new HDWalletProvider(
        configs.proxy_mnemonic,
        configs.provider
    );
    const web3Instance = new web3(provider);

    const nftContract = new web3Instance.eth.Contract(
        NFT_CONTRACT_ABI,
        configs.contract_address, { gasLimit: "5000000" }
    );
    let name = 'polygonme'
    console.log('Minting random name: ' + name)
    let price = 10;
    if (name.length > 5 && name.length <= 10) {
        price = 5;
    } else if (name.length > 10) {
        price = 2;
    }

    console.log('Price is ' + price + ' MATIC')
    console.log(price.toString() + "000000000000000000")

    try {
        console.log('Trying mint...')
        const check = await nftContract.methods._nameToTokenId(name).call();
        if (parseInt(check) === 0) {
            const nonce = await web3Instance.eth.getTransactionCount(configs.proxy_address)
            console.log('Using nonce: ' + nonce)
            const result = await nftContract.methods
                .mintName(name, 'dao')
                .send({ from: configs.proxy_address, value: price.toString() + "000000000000000000", nonce: nonce, gasPrice: "200000000000" }).on('transactionHash', tx => {
                    console.log('Pending transaction: ' + tx)
                })
            console.log("Minted! Transaction: " + result.transactionHash);
        } else {
            console.log('This name exists')
        }
        process.exit()
    } catch (e) {
        console.log(e.message)
        process.exit()
    }

}

if (argv._ !== undefined) {
    main();
} else {
    console.log('Provide a configs contract first.')
}