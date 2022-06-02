import { inputData } from "./inputData";
const ethers = require("ethers");
require("dotenv").config();

const VaultHealerAbi = require("../abi_files/VaultHealer_abi.json");
const boostPoolAbi = require("../abi_files/BoostPool_abi.json");

export const createBoostPool = async (
  network: string,
  reward: string,
  vid: number,
  duration: number, //in days 
  hoursToStart: number,
  totalRewards: number,
  decimals: number
) => {
  const mnemonic = process.env.MNEMONIC;

  let web3EndPoint;
  let vaultHealerAddr;
  let boostPoolAddr;
  let blocksPerDay;

  if (network == "bsc") {
    let data = inputData.BSC;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
    boostPoolAddr = data.V3Vaults.boostPoolImpl;
    blocksPerDay = 28800;
  }
  if (network == "cronos") {
    let data = inputData.Cronos;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
    boostPoolAddr = data.V3Vaults.boostPoolImpl;
    blocksPerDay = 17280;
  }
  if (network == "polygon") {
    let data = inputData.Polygon;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
    boostPoolAddr = data.V3Vaults.boostPoolImpl;
    blocksPerDay = 43200;
  }

  const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);

  const dev = wallet.connect(provider);

  const VaultHealer = new ethers.Contract(vaultHealerAddr, VaultHealerAbi, dev);
  const BoostPool = new ethers.Contract(
    boostPoolAddr,
    boostPoolAbi,
    web3EndPoint
  );

  

  const delayBlocks = Math.floor(hoursToStart * (blocksPerDay / 60));
  console.log("delayBlocks:", delayBlocks);

  const durationBlocks = Math.floor(duration * blocksPerDay);
  console.log("durationBlocks:", durationBlocks);

  const rawTotalRewards = Math.floor(totalRewards * Math.pow(10, decimals));
  console.log("rawTotalRewards:", rawTotalRewards);

  const rewardPerBlock = Math.floor(rawTotalRewards / durationBlocks);
  console.log("rewardPerBlock:", rewardPerBlock);

  const initData: string = await BoostPool.generateInitData(
    reward,
    rewardPerBlock,
    delayBlocks,
    durationBlocks
  );
  console.log("initData:", initData);

  const BOOST = await VaultHealer.createBoost(vid, boostPoolAddr, initData);
  const BOOSTCreationTxn = await BOOST.wait();

  console.log(
    "Boost Proxy Created at Address:",
    BOOSTCreationTxn.events[0].address
  );
};
createBoostPool("bsc", "0x", 0x0, 0x0, 0x0, 0x0, 0x0);
