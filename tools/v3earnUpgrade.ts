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
    vgAddr: "0x4eb09675e62068798baB0720Db57b9C4240238ec",
  },
  cronos: {
    rpc: process.env.CRONOS_RPC,
    vhAddr: "0xba6f3b9bf74fbfa59d55e52fa722e6a5737070d0",
    vgAddr: "0x32c2f6ABafFD3c456527593F10AB41368abC4FfC",
  },
  bsc: {
    rpc: process.env.BSC_RPC,
    vhAddr: "0x662018D4fbD804631920d45610E0Ee928Ca75d7c",
    vgAddr: "0x564dcD7907f3D392955cDDBEcB5d4bbE2A443AF1",
  },
  moonbeam: {
    rpc: process.env.MOONBEAM_RPC,
    vhAddr: "0x14E1BC2Da67dE9e9eFd7116d9D2f6801374c32a7",
    vgAddr: "0xa87866539FcC617d0fe7957ef67Fe9f5B3d9E3e6",
  },
  iotex: {
    rpc: process.env.IOTEX_RPC,
    vhAddr: "0x7ed45aa141AB8bD7a2db7285EE59A468d1a7B218",
    vgAddr: "",
  },
  ftm: {
    rpc: process.env.FTM_RPC,
    vhAddr: "0x38351946dbe1b096aed86b299d48d4a4d7444ea8",
    vgAddr: "0x7A569f819Be7D9dD04223DF3255a2FFDC921329C",
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

  const [blockTime, latestBlock]: number & any = await calculateBlockTime(dev);
  const approxBlocksPerPeriod = Math.floor(85000 / blockTime);

  const maxEarnsPerCall = 8;

  const VaultHealer: any = new ethers.Contract(
    CHAIN_DATA[CSD.network.toLowerCase()].vhAddr,
    ABI.VaultHealer,
    dev
  );

  const VaultGetter: any = new ethers.Contract(
    CHAIN_DATA[CSD.network.toLowerCase()].vgAddr,
    ABI.VaultGetter,
    dev
  );

  console.log(
    `Checkings Vaults Who's last earned block is before block: ${
      latestBlock.number - approxBlocksPerPeriod
    }`
  );

  let activeVids: any[] = await VaultGetter.getActiveVaultsLastEarnedBefore(
    latestBlock.number - approxBlocksPerPeriod
  );

  if (activeVids.length != 0) {
    for (let i = 0; i < activeVids.length; i += maxEarnsPerCall) {
      let vidsToEarn: number[] = activeVids.slice(i, i + maxEarnsPerCall);
      let EARN_CALL: any = await VaultHealer.earn(vidsToEarn, {
        gasPrice: await dev.provider.getGasPrice(),
      });
      let EARN_CALL_RECEIPT: any = await EARN_CALL.wait(1);
      console.log(`CONFIRMED, TXN HASH: ${EARN_CALL_RECEIPT.transactionHash}`);
      await V3Earn();
    }
  } else {
    console.log(
      `All Vaults on ${CSD.network} have been earned in the last ${approxBlocksPerPeriod} blocks :) Have a nice day!`
    );
    await V3Earn();
  }
};

export const calculateBlockTime = async (dev) => {
  const delayBetweenSamples: number = 25000;
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
