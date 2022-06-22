const ethers = require("ethers");
require("dotenv").config();

const AmysStakingCoAbi = require("../src/config/abi_files/AmysStakingCoV2_abi.json");

export const syncASC = async (chefAddr: string, ASC) => {
  const status = await ASC.chefs(chefAddr);
  if (status.pidLast == 0) {
    console.log("Chef Not Synced! Syncing now for you ser");
    var SYNC = await ASC.sync(chefAddr, { gasLimit: 5000000 });
    console.log("Chef Synced, LFG!", SYNC.hash);
    return status.chefType;
  } else console.log("Chef Already Synced");
  return status.chefType
};
