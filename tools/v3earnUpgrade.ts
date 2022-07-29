import { inputData, ABI } from "../src/config/inputData";
import { ChainSpecificData } from "../src/config/types";
import { initDev } from "../src/InitialiseWeb3";
import { PromptNetwork } from "../src/promptNetwork";
const ethers = require("ethers");
require("dotenv").config();

const CHAIN_DATA: Object = {
  polygon: {
    rpc: process.env.POLYGON_RPC,
    vhAddr: "0xA1b26B5eC4a73A6a632bE1f45FfC628518c0AFD6",
    vgAddr: "0x28075bAaD278304382C08ed431fcaDd7e66F2696",
  },
  cronos: {
    rpc: process.env.CRONOS_RPC,
    vhAddr: "0xba6f3b9bf74fbfa59d55e52fa722e6a5737070d0",
    vgAddr: "0x151c430DC5050439EE25237131e0A79c46EC54A4",
  },
  bsc: {
    rpc: process.env.BSC_RPC,
    vhAddr: "0x662018D4fbD804631920d45610E0Ee928Ca75d7c",
    vgAddr: "0x390f3a0020d07eeee7c416ea5d5b5851ec8c6ec6",
  },
  moonbeam: {
    rpc: process.env.MOONBEAM_RPC,
    vhAddr: "0x14E1BC2Da67dE9e9eFd7116d9D2f6801374c32a7",
    vgAddr: "0xE1cbecb5A3324fA5d8C59Fcfdc2752163734a292",
  },
  iotex: {
    rpc: process.env.IOTEX_RPC,
    vhAddr: "0x7ed45aa141AB8bD7a2db7285EE59A468d1a7B218",
    vgAddr: "",
  },
  ftm: {
    rpc: process.env.FTM_RPC,
    vhAddr: "0x38351946dbe1b096aed86b299d48d4a4d7444ea8",
    vgAddr: "",
  },
  bttc: {
    rpc: process.env.BTTC_RPC,
    vhAddr: "",
    vgAddr: "",
  },
};



export const V3Earn = async () => {
  const CSD: ChainSpecificData = await PromptNetwork();
  const dev: any = await initDev(CSD.network);
  const V3Addresses: any = inputData[CSD.network].V3Vaults;

  const [blockTime, latestBlock]: number & any = await calculateBlockTime(dev);
  const approxBlocksPerDay = Math.floor(86400 / blockTime);


  const maxEarnsPerCall = 8

  const VaultHealer: any = new ethers.Contract(
    V3Addresses.VaultHealer,
    ABI.VaultHealer,
    dev
  );

  const VaultGetter: any = new ethers.Contract(
    V3Addresses.VaultGetterV3,
    ABI.VaultGetter,
    dev
  );

  let activeVaults: any[] = await VaultGetter.getActiveVaultsLastEarnedBefore(
    latestBlock.number - approxBlocksPerDay
  );
  let chainID = (dev.provider._network.chainId)
  
  if (activeVaults.length != 0) {
    let activeVids: number[] = new Array();

    activeVaults.forEach((vault: any) => {
      activeVids.push(vault.vid.toNumber());
    });


    for (let i = 0; i < activeVids.length; i += maxEarnsPerCall) {
      let vidsToEarn: number[] = activeVids.slice(i, i + maxEarnsPerCall);
      let gasPrice = chainID == 137 ? await dev.provider.getGasPrice() * 1.1
      console.log(vidsToEarn)

      console.log((await dev.provider.getGasPrice()).toNumber())
      let EARN_CALL: any = await VaultHealer.earn(vidsToEarn, {gasLimit: 10000000, gasPrice});
      let EARN_CALL_RECEIPT: any = await EARN_CALL.wait(1);
      console.log(EARN_CALL_RECEIPT)

      
    }
  } else {
    console.log(`All Vaults have been earned in the last ${approxBlocksPerDay} blocks :) Have a nice day!`);
  }
};

export const calculateBlockTime = async (dev) => {
  const delayBetweenSamples: number = 250;
  const latestBlock: any = await dev.provider.getBlock();
  const bottomRangeBlockNumber: number =
    latestBlock.number - delayBetweenSamples;
  const bottomRangeBlock: any = await dev.provider.getBlock(
    bottomRangeBlockNumber
  );

  const avgBlockTimeForSample: number =
    (latestBlock.timestamp - bottomRangeBlock.timestamp) / delayBetweenSamples;
  return [avgBlockTimeForSample, latestBlock];
};

V3Earn();
