import { platform } from "os";
import { syncASC } from "../utils/syncASC";
import { inputData } from "./inputData";
const ethers = require("ethers");
require("dotenv").config();

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

const StrategyAbi = require("../abi_files/Strategy_abi.json");
const PriceGetterAbi = require("../abi_files/PriceGetter_abi.json");
const UniV2FactoryAbi = require("../abi_files/UniV2Factory_abi.json");
const VaultHealerAbi = require("../abi_files/VaultHealer_abi.json");
const AmysStakingCoAbi = require("../abi_files/AmysStakingCoV2_abi.json");

export const getDeploymentData = async (
  network,
  platform,
  tokenA,
  tokenB,
  farmSite
) => {
  let data;
  let web3EndPoint: string;
  let vaultHealerAddr: string;
  let stratAddr: string;
  let priceGetterAddr: string;
  let ascAddr: string;

  if (network == "bsc") {
    data = inputData.BSC;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
    stratAddr = data.V3Vaults.StratImpl;
    priceGetterAddr = data.V3Vaults.PriceGetter;
    ascAddr = data.V3Vaults.AmysStakingCoAddr;
  }
  if (network == "cronos") {
    data = inputData.Cronos;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
    stratAddr = data.V3Vaults.StratImpl;
    priceGetterAddr = data.V3Vaults.PriceGetter;
    ascAddr = data.V3Vaults.AmysStakingCoAddr;
  }
  if (network == "polygon") {
    data = inputData.Cronos;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
    stratAddr = data.V3Vaults.StratImpl;
    priceGetterAddr = data.V3Vaults.PriceGetter;
    ascAddr = data.V3Vaults.AmysStakingCoAddr;
  }

  const tokenAddrs = [data.tokens[tokenA], data.tokens[tokenB]];
  console.log(tokenAddrs);
  const chefAddr = data.farms[farmSite];
  console.log(chefAddr);

  const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);

  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);

  const dev = wallet.connect(provider);

  const VaultHealer = new ethers.Contract(vaultHealerAddr, VaultHealerAbi, dev);
  const ASC = new ethers.Contract(ascAddr, AmysStakingCoAbi, dev);

  const Factory = new ethers.Contract(
    data.factories[platform],
    UniV2FactoryAbi,
    dev
  );

  //determine want address
  const wantAddr = await Factory.getPair(tokenAddrs[0], tokenAddrs[1]);
  console.log("WantAddress:", wantAddr);

  await syncASC(chefAddr, data);

  // const farmPid = await ASC.findPool(chefAddr, wantAddr);

  // console.log("Pid on Farm found as:", farmPid);
};

getDeploymentData("bsc", "PancakeSwap", "CAKE", "BUSD", "PancakeSwap");
