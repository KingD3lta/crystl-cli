import { inputData } from "./inputData";
const ethers = require("ethers");
require("dotenv").config();

const StrategyAbi = require("../abi_files/Strategy_abi.json");
const PriceGetterAbi = require("../abi_files/PriceGetter_abi.json");
const VaultHealerAbi = require("../abi_files/VaultHealer_abi.json");
const AmysStakingCoAbi = require("..AmysStakingCo_abi.json/abi_files/")

//   POLYGON FARMS   //
const GreenHouse = require("./VaultCreationConfigs/GreenHouse");
const ApeSwap = require("./VaultCreationConfigs/ApeSwap");
const QiDAO = require("./VaultCreationConfigs/QIDAO");
const Gravity = require("./VaultCreationConfigs/Gravity");
//   CRONOS FARMS   //
const CronaSwap = require("./configs/CronaSwap");
//   BSC FARMS   //
const PancakeSwap = require("./VaultCreationConfigs/PancakeSwap");
const BabySwap = require("./VaultCreationConfigs/BabySwap");
const ApeSwapBSC = require("./VaultCreationConfigs/ApeSwapBSC");

export const createMaxi = async (network, farm, targetVid) => {
  let web3EndPoint: string;
  let vaultHealerAddr: string;
  let stratAddr: string;
  let priceGetterAddr: string;
  let ascAddr: string;

  if (network == "bsc") {
    let data = inputData.BSC;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
    stratAddr = data.V3Vaults.StratImpl;
    priceGetterAddr = data.V3Vaults.PriceGetter;
    ascAddr = data.V3Vaults.AmysStakingCoAddr;
  }
  if (network == "cronos") {
    let data = inputData.Cronos;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
    stratAddr = data.V3Vaults.StratImpl;
    priceGetterAddr = data.V3Vaults.PriceGetter;
    ascAddr = data.V3Vaults.AmysStakingCoAddr;
  }
  if (network == "polygon") {
    let data = inputData.Cronos;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
    stratAddr = data.V3Vaults.StratImpl;
    priceGetterAddr = data.V3Vaults.PriceGetter;
    ascAddr = data.V3Vaults.AmysStakingCoAddr;
  }
  const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);


  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);

  const dev = wallet.connect(provider);

  const VaultHealer = new ethers.Contract(vaultHealerAddr, VaultHealerAbi, dev);
  const Strategy = new ethers.Contract(stratAddr, StrategyAbi);
  const PriceGetter = new ethers.Contract(priceGetterAddr, PriceGetterAbi)
  const ASC = new ethers.Contract(ascAddr, AmysStakingCoAbi);

  

};
