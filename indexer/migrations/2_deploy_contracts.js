const IndexerME = artifacts.require("./IndexerME.sol");
const fs = require('fs')

module.exports = async (deployer, network) => {

  let PolygonMEAddress
  if (network === 'ganache') {
    PolygonMEAddress = "0xcA7e43663f46DC46a8D51c539A08cF3DFA737BF0"
  }

  await deployer.deploy(IndexerME, PolygonMEAddress);
  const contract = await IndexerME.deployed();

  let configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
  console.log('Saving address in config file..')
  configs.contract_address = contract.address
  fs.writeFileSync(process.env.CONFIG, JSON.stringify(configs, null, 4))
  console.log('--')
};
