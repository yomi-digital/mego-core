const PolygonME = artifacts.require("./PolygonME.sol");
const fs = require('fs')

module.exports = async (deployer, network) => {
 
  await deployer.deploy(PolygonME);
  const contract = await PolygonME.deployed();
  
  let configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
  console.log('Saving address in config file..')
  configs.contract_address = contract.address
  fs.writeFileSync(process.env.CONFIG, JSON.stringify(configs, null, 4))
  console.log('--')
};
