import { inputData } from "../src/config/inputData";
const ethers = require("ethers");
require("dotenv").config();

const V2VaultHealerAbi = require("../abi_files/V2VaultHealer_abi.json");
const V2StrategyAbi = require("../abi_files/V2Strategy_abi");

export const convertDustV2 = async (network: string) => {
  let web3EndPoint: string;
  let v2Vaulthealer: string;
  if (network == "bsc") {
    console.log("V2 Vaults not live on BSC, please use a different chain.");
    return;
  }
  if (network == "cronos") {
    let data = inputData.CRONOS;
    web3EndPoint = data.ENDPOINT;
    v2Vaulthealer = data.V3Vaults.V2VaultHealer;
  }
  if (network == "polygon") {
    let data = inputData.POLYGON;
    web3EndPoint = data.ENDPOINT;
    v2Vaulthealer = data.V3Vaults.V2VaultHealer;
  }
  const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);

  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);

  const dev = wallet.connect(provider);

  const V2VaultHealer = new ethers.Contract(
    v2Vaulthealer,
    V2VaultHealerAbi,
    dev
  );
  let poolInfo = await V2VaultHealer.poolInfo(0);
  var V2Strategy = new ethers.Contract(poolInfo.strat, V2StrategyAbi, dev);

  let vaultPidArray = new Array();

  let vhPoolLength: number = await V2VaultHealer.poolLength();
  console.log("VH POOL LENGTH:", vhPoolLength.toString());

  for (let i = 0; i < vhPoolLength; i++) {
    poolInfo = await V2VaultHealer.poolInfo(i);
    //console.log("StrategyAddress:",poolInfo.strat)
    V2Strategy = V2Strategy.attach(poolInfo.strat);
    if (!(await V2Strategy.paused())) {
      vaultPidArray.push(i);
      console.log(
        "PID:[",
        i,
        "] active, pushing to array and attempting to convert Dust"
      );
      try {
        await V2Strategy.convertDustToEarned();
      } catch {
        console.warn(
          "Automated Dust Conversion unsuccessful for Strategy:",
          poolInfo.strat,
          "Please Check Manually"
        );
      }
    }
  }
};
convertDustV2("cronos");
