import { inputData } from "../src/inputData";
const ethers = require("ethers");
require("dotenv").config();

const StrategyAbi = require("../abi_files/Strategy_abi.json");
const VaultHealerAbi = require("../abi_files/VaultHealer_abi.json");
const RouterAbi = require("../abi_files/UniRouter_abi.json");
const ERC20Abi = require("../abi_files/ERC20_abi.json");

export const v3pause = async (network) => {
  let web3EndPoint: string;
  let vaultHealerAddr: string;

  if (network == "bsc") {
    let data = inputData.BSC;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = "0x9Fe22630DE9Ec654256AB103adD153D93c4D329C";
  }
  if (network == "cronos") {
    let data = inputData.Cronos;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
  }
  if (network == "polygon") {
    let data = inputData.Cronos;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
  }
  const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);

  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);

  const dev = wallet.connect(provider);

  const VaultHealer = new ethers.Contract(vaultHealerAddr, VaultHealerAbi, dev);
  const minVid = 1;
  const numVaults = await VaultHealer.numVaultsBase();

  var vidArray = Array.from({ length: numVaults }, (_, i) => i + minVid);

  for (let i = 0; i < vidArray.length; i++) {
    var numMaximizers = (await VaultHealer.vaultInfo(vidArray[i]))
      .numMaximizers;
    console.log("Maximisers found:", numMaximizers);
    if(numMaximizers > 0){
    var maxiArray = Array.from(
      { length: numMaximizers },
      (_, j) => j + (minVid << 16) + 1
    );
    console.log("Pausing Vids:", maxiArray);
    for(let i = 0; i < maxiArray.length; i++){
    const pause = await VaultHealer.pause(maxiArray[i],false);
    console.log("Vid",maxiArray[i],"paused, transaction:",pause.hash)
  }}
}
  console.log("Earning Vids:", vidArray);
  for(let i = 0; i < maxiArray.length; i++){
    const pause = await VaultHealer.pause(vidArray[i],false);
    console.log("Vid",maxiArray[i],"paused, transaction:",pause.hash)
  }

};

v3pause("bsc")