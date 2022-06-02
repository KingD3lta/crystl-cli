import { inputData } from "../src/inputData";
const ethers = require("ethers");
require("dotenv").config();

const AmysStakingCoAbi = require("../abi_files/AmysStakingCoV2_abi.json");

export const syncASC = async (chefAddr: string, data) => {
  console.log("CHECKING SYNC OF ASC")
  let ascAddr = data.V3Vaults.AmysStakingCoAddr
  let web3EndPoint = data.ENDPOINT

  console.log("ChefAddress:",chefAddr)

  const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);

  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);

  const dev = wallet.connect(provider);

  const ASC = new ethers.Contract(ascAddr, AmysStakingCoAbi, dev);


  const status = await ASC.chefs(chefAddr);
  if(status.pidLast == 0 ){
    console.log("Chef Not Synced! Syncing now for you ser")
    console.log("Gas Limit:", await ASC.estimateGas.sync(chefAddr))
    // await ASC.sync(chefAddr, [gasLimit: 10000])
    // console.log("Chef Synced, LFG!")
  }

  

  // if (status[0] == 0 && status[1] == 0) {
  //   await ASC.sync(chefAddr);
  //   console.log("ASC synced with Address:", chefAddr);

  // }
};
