import { ABI, inputData } from "./config/inputData";
import { initDev } from "./InitialiseWeb3";
const chalk = require("chalk");

const ethers = require("ethers");
require("dotenv").config();

const BigNumberify = ethers.BigNumber.from;

export const createInitData = async (
  network: string,
  reward: string,
  vid: number,
  duration, //in days
  hoursToStart,
  totalRewards,
  decimals
) => {
  const mnemonic = process.env.MNEMONIC;

  duration = BigNumberify(duration);
  hoursToStart = BigNumberify(hoursToStart);
  totalRewards = BigNumberify(totalRewards);

  const data = inputData[network];
  const web3EndPoint = data.ENDPOINT;
  const boostPoolAddr = data.V3Vaults.BoostPool;
  console.log(data, web3EndPoint, boostPoolAddr)

  if (network == "BSC") {
    var blocksPerDay = BigNumberify(28800);
  }
  if (network == "CRONOS") {
    var blocksPerDay = BigNumberify(17280);
  }
  if (network == "POLYGON") {
    var blocksPerDay = BigNumberify(43200);
  }

  const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  const dev = wallet.connect(provider);

  const BoostPool = new ethers.Contract(boostPoolAddr, ABI.BoostPool, dev);

  const delayBlocks = hoursToStart.mul(blocksPerDay.div(60));

  const durationBlocks = duration.mul(blocksPerDay);

  const rawTotalRewards = totalRewards.mul(BigNumberify(10).pow(decimals));

  const rewardPerBlock = rawTotalRewards.div(durationBlocks);

  const initData: string = await BoostPool.generateInitData(
    data.tokens[reward],
    rewardPerBlock,
    delayBlocks,
    durationBlocks
  );
  const VaultHealer = new ethers.Contract(
    inputData[network].V3Vaults.VaultHealer,
    ABI.VaultHealer,
    dev
  );

  const nextBoostPool = await VaultHealer.nextBoostPool(vid);
  // console.log("initData:", initData);
  console.log(chalk.yellow.bold("New Boost Pool Address:"),(nextBoostPool[1]));
  console.log(chalk.cyanBright.bold("*** PLEASE FUND THIS ADDRESS WITH THE REWARDS BEFORE CONTINUING ***"))
  // console.log("VID", vid.toString(16));
  // console.log("Next Boost Pool:", nextBoostProxyAddr);
  return initData;
};

export const createBoost = async (
  network: string,
  vid: number,
  initData: string
) => {
  const mnemonic = process.env.MNEMONIC;

  const dev = await initDev(network)
  console.log(inputData[network].V3Vaults.VaultHealer,
  ABI.VaultHealer,
  dev)
  const VaultHealer = new ethers.Contract(
    inputData[network].V3Vaults.VaultHealer,
    ABI.VaultHealer,
    dev
  );
  const boostPoolAddr = inputData[network].V3Vaults.BoostPool
  const BOOST = await VaultHealer.createBoost(vid, boostPoolAddr, initData);
  const BOOSTCreationTxn = await BOOST.wait();

  console.log(
    "Boost Proxy Created at Address:",
    BOOSTCreationTxn.events[0].address
  );
};

// createInitData(
//   "CRONOS", //network
//   "0xadbd1231fb360047525BEdF962581F3eee7b49fe", //address of token to boost with
//   327683, //vid to boost
//   7, //duration of boostPool
//   3, //hours before start
//   120000, //total rewards emitted ( in regular format is fine as the script will make it thicc)
//   18 //decimals of the earned token ( please donut shag this up <3 )
// );
