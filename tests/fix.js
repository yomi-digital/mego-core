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
        console.log('Trying adjusting personal details...')
        const result = await nftContract.methods
            .fixDetails(1, "0xaF8106c0F119df2f5D923432DD71A8d264EBE3e7", "0xaF8106c0F119df2f5D923432DD71A8d264EBE3e7", "132CFpdRwv2oyLESQtGXa8jcKaa7NE8y8C", "hey@yomi.digital", "https://yomi.digital", "@yomidigitalhub", "#000000", "#ffffff",
                `<style type="text/css">.st0{fill:#FFFFFF;}</style>
            <g id="Livello_2_1_"
                transform="matrix(1.0740671,0,0,0.93644266,11.702932,14.034713)">
                <g
                id="Livello_1-2">
                <path
                    class="st0"
                    width="400"
                    y="10"
                    x="10"
                    d="m 208.2,0 h -78.3 c -2.4,0 -4.3,1.9 -4.3,4.3 v 63.5 c 0,2.4 -2,4.3 -4.3,4.2 -1.1,0 -2.2,-0.5 -3,-1.2 L 47.3,1.2 C 46.5,0.4 45.4,0 44.3,0 H 4.3 C 1.9,0 0,1.9 0,4.2 v 0 72.2 c 0,2.4 1.9,4.3 4.3,4.3 v 0 h 91.8 c 2.8,0 5,2.2 5,5 0,2.8 -2.2,5 -5,5 H 4.3 C 1.9,90.8 0,92.7 0,95 v 72.2 c 0,2.4 1.9,4.3 4.3,4.3 h 117 c 2.4,0 4.3,-1.9 4.3,-4.3 V 95 c 0,-2.4 -1.9,-4.3 -4.3,-4.3 h -5.9 c -2.8,0 -5,-2.2 -5,-5 0,-2.8 2.2,-5 5,-5 h 92.8 c 2.4,0 4.3,-1.9 4.3,-4.3 V 4.3 C 212.4,1.9 210.5,0 208.2,0"
                    id="path884" />
                <path
                    class="st0"
                    d="m 345,264.7 h 92.3 c 2.4,0 4.3,-1.9 4.3,-4.3 v -72.2 c 0,-2.4 -1.9,-4.3 -4.3,-4.3 H 233.4 c -2.4,0 -4.3,1.9 -4.3,4.3 v 72.2 c 0,2.4 1.9,4.3 4.3,4.3 h 92.3 c 2.8,0 5,2.2 5,5 0,2.8 -2.2,5 -5,5 h -92.3 c -2.4,0 -4.3,1.9 -4.3,4.3 v 72.2 c 0,2.4 1.9,4.3 4.3,4.3 v 0 h 203.9 c 2.4,0 4.3,-1.9 4.3,-4.3 V 279 c 0,-2.4 -1.9,-4.3 -4.3,-4.3 H 345 c -2.8,0 -5,-2.2 -5,-5 0,-2.8 2.2,-5.1 5,-5"
                    id="path886" />
                <path
                    class="st0"
                    d="m 208.2,183.9 h -39.7 c -1.3,0 -2.6,0.6 -3.4,1.6 l -55.5,68.8 c -1.5,1.9 -4.1,2.2 -6,0.7 -0.3,-0.2 -0.5,-0.5 -0.7,-0.7 L 47.4,185.5 c -0.8,-1 -2.1,-1.6 -3.4,-1.6 H 4.3 c -2.4,0 -4.3,1.9 -4.3,4.2 v 0 163 c 0,2.4 1.9,4.3 4.3,4.3 H 97 c 2.4,0 4.3,-1.9 4.3,-4.3 v -81.5 0 c 0,-2.8 2.2,-5 5,-5 2.8,0 5,2.2 5,5 v 81.5 c 0,2.4 1.9,4.3 4.3,4.3 h 92.7 c 2.4,0 4.3,-1.9 4.3,-4.3 v -163 c -0.1,-2.3 -2,-4.2 -4.4,-4.2 v 0"
                    id="path888" />
                <path
                    class="st0"
                    d="m 335.3,13.9 c 39.7,0 71.9,32.2 71.9,71.9 0,39.7 -32.2,71.9 -71.9,71.9 -39.7,0 -71.9,-32.2 -71.9,-71.9 v 0 c 0.1,-39.7 32.2,-71.9 71.9,-71.9 M 437.3,0 H 233.4 c -2.4,0 -4.3,1.9 -4.3,4.3 v 163 c 0,2.4 1.9,4.3 4.3,4.3 h 203.9 c 2.4,0 4.3,-1.9 4.3,-4.3 V 4.3 C 441.5,1.9 439.6,0 437.3,0"
                    id="path890" />
                <path
                    class="st0"
                    d="m 199.2,166.9 c 0,2.9 -1.8,4.4 -5.4,4.4 h -8.1 v -15.4 h 7.7 c 3.6,0 5.4,1.4 5.4,4.3 0.2,1.4 -0.7,2.8 -2,3.3 1.5,0.4 2.5,1.8 2.4,3.4 m -2.3,-6.7 c 0.1,-0.8 -0.4,-1.6 -1.1,-2 -0.8,-0.3 -1.6,-0.4 -2.4,-0.4 h -5.8 v 4.8 h 5.8 c 0.8,0 1.6,-0.1 2.4,-0.4 0.7,-0.4 1.1,-1.2 1.1,-2 m 0.3,6.7 c 0.1,-0.8 -0.4,-1.6 -1.1,-2 -0.8,-0.3 -1.6,-0.4 -2.4,-0.4 h -6.2 v 4.8 h 6.2 c 0.8,0 1.6,-0.1 2.4,-0.4 0.8,-0.3 1.2,-1.1 1.1,-2 M 175,163.6 c 0.1,2 -0.5,3.9 -1.7,5.4 -2.5,2.8 -6.8,3 -9.6,0.5 -0.2,-0.2 -0.4,-0.3 -0.5,-0.5 -1.2,-1.6 -1.7,-3.5 -1.7,-5.4 v -7.7 h 1.9 v 7.7 c -0.1,1.4 0.3,2.9 1.1,4.1 0.9,1.2 2.2,1.8 3.7,1.7 1.4,0.1 2.8,-0.6 3.7,-1.7 0.8,-1.2 1.2,-2.6 1.1,-4.1 v -7.7 h 1.9 v 7.7 z m -26.1,7.7 v -6.8 h -8.7 v 6.8 h -1.9 v -15.4 h 1.9 v 6.8 h 8.7 v -6.8 h 1.9 v 15.4 z M 180,141.8 v -15.4 h 1.9 v 13.5 h 8.7 v 1.9 z m -12.3,0 -1.4,-3.9 h -6.8 l -1.4,3.9 h -2 l 5.6,-15.4 h 2.4 l 5.6,15.4 z m -4.8,-13.1 -2.7,7.3 h 5.4 z m -18.5,-0.4 v 13.5 h -1.9 v -13.5 h -4.8 v -1.9 h 11.6 v 1.9 z m 54.7,-31.4 h 1.9 v 15.4 h -1.9 z m -12.6,15.5 V 110 c -1.1,1.6 -2.9,2.5 -4.9,2.4 -1.9,0.1 -3.8,-0.8 -5.1,-2.3 -2.2,-3.3 -2.2,-7.6 0,-10.9 1.2,-1.5 3.1,-2.4 5.1,-2.3 1.4,-0.1 2.7,0.3 3.8,1 1.1,0.8 1.9,1.8 2.3,3.1 l -1.9,0.5 c -1.1,-2.4 -3.9,-3.4 -6.3,-2.3 -0.6,0.3 -1.2,0.7 -1.7,1.3 -1.5,2.5 -1.5,5.6 0,8.1 0.9,1.2 2.2,1.8 3.7,1.7 1.3,0.1 2.5,-0.4 3.4,-1.4 0.8,-1 1.3,-2.2 1.4,-3.4 h -4.8 v -1.9 h 6.8 v 8.7 z M 162.4,96.9 h 1.9 v 15.4 h -1.9 z m -10.6,7.8 c 0.1,1.9 -0.5,3.9 -1.7,5.4 -1.2,1.5 -3.1,2.4 -5.1,2.3 h -6.7 V 96.9 h 6.7 c 2,-0.1 3.8,0.8 5.1,2.3 1.2,1.6 1.8,3.5 1.7,5.5 m -1.9,0 c 0.1,-1.4 -0.3,-2.8 -1.1,-4 -0.9,-1.2 -2.2,-1.8 -3.7,-1.7 h -4.8 v 11.6 h 4.8 c 1.4,0.1 2.8,-0.6 3.7,-1.7 0.7,-1.3 1.1,-2.7 1.1,-4.2"
                    id="path892" />
                </g>
            </g>`,
            "This is my personal description."
            )
            .send({ from: configs.proxy_address });
        console.log("Fixed! Transaction: " + result.transactionHash);
        const changed = await nftContract.methods.tokenURI(1).call();
        const decodedStr = JSON.parse(Buffer.from(changed.split('base64,')[1], 'base64').toString());
        console.log(decodedStr)
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
