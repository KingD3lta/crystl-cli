import { inputData } from "./src/inputData";
const Web3 = require("Web3");
const ethers = require("ethers");
require("dotenv").config();
const POLYGON_RPC = process.env.POLYGON_RPC;
const CRONOS_RPC = process.env.CRONOS_RPC;
const BSC_RPC = process.env.BSC_RPC;

const StrategyAbi = require("./abi_files/Strategy_abi.json");
const PriceGetterAbi = require("./abi_files/PriceGetter_abi.json");
const VaultHealerAbi = require("./abi_files/VaultHealer_abi.json");
//FarmData - POLYGON
import { GreenHouse } from "./VaultCreationConfigs/GreenHouse";
import { ApeSwap } from "./VaultCreationConfigs/ApeSwap";
import { QIDAO } from "./VaultCreationConfigs/QIDAO";
import { Gravity } from "./VaultCreationConfigs/Gravity";
//FarmData - CRONOS
import { CronaSwap } from "./VaultCreationConfigs/CronaSwap";
//BSC
import { PancakeSwap } from "./VaultCreationConfigs/PancakeSwap";
import { BabySwap } from "./VaultCreationConfigs/BabySwap";
import { BiSwap } from "./VaultCreationConfigs/BiSwap";
import { ApeSwapBSC } from "./VaultCreationConfigs/ApeSwapBSC";
import { VVSFinance } from "./VaultCreationConfigs/VVSFinance";
import { PhotonSwap } from "./VaultCreationConfigs/PhotonSwap";
import { AnnexCronos } from "./VaultCreationConfigs/AnnexCronos";
import { QuickSwap } from "./VaultCreationConfigs/QuickSwap";
import { PolyDogeDao } from "./VaultCreationConfigs/PolyDogeDao";

const web3 = new Web3(new Web3.providers.HttpProvider(POLYGON_RPC));

//Constants - POLYGON
// let StratImplementationAddress = "0x57Ff558daA818B36af32A031ac92836aFd53426c"; //for reg strats
// let StratQuickImplementationAddress = "0xb076E4b9dd071955F02fC5e388BFf3ac3bCCe5b7";
// const PriceGetterAddress = "0x8b2d2279F722BbB38A32b5ddd050378ffdF28Ee4";
// const MagnetiteAddress = "0x6c9102aDfE6903A383aD2fc12B75152cD45Dd164" //note is proxy
// let VaultHealerAddress = "0xA1b26B5eC4a73A6a632bE1f45FfC628518c0AFD6";

//Constants - CRONOS
// const StratImplementationAddress = "0x04153E4493bD15ABd530670F23a8Dc53D6eE3068"; //for reg strats
// const PriceGetterAddress = "0xb9B5792791DC8A76123A4545253D73F4624cc0B3";
// const MagnetiteAddress = "0x5e740b6cb14b8df73a44e3b6c059e5b3310f6af9"; //note is proxy
// const VaultHealerAddress = "0xba6f3b9bf74fbfa59d55e52fa722e6a5737070d0";

//Constants - BSC
const StratImplementationAddress = "0x20058692742dE4CdeF5043c80254dE526160b16D";
const PriceGetterAddress = "0x6993fFaB6FD7c483f33A5E3EFDFEA676425C8F31";
const MagnetiteAddress = "0xcde81e620245a22afeb694db93b681798ece0d4d";
const VaultHealerAddress = "0x662018D4fbD804631920d45610E0Ee928Ca75d7c"; // prod

let PriceGetterInstance = new web3.eth.Contract(
  PriceGetterAbi,
  PriceGetterAddress
);
let StratInstance = new web3.eth.Contract(
  StrategyAbi,
  StratImplementationAddress
);
let VaultHealerInstance = new web3.eth.Contract(
  VaultHealerAbi,
  VaultHealerAddress
);

let earnedDustArray = new Array();

export const createVault = async (farm) => {
  console.log("Creating Vault from the following Config Data:", farm);
  console.log("calculating want Dust");
  let wantDust = await calcWantDust(farm.want);
  console.log("Want dust:", wantDust);
  await calcEDust(farm.earned);
  console.log("EDust = ", earnedDustArray);
  if (farm.type == "1") {
    console.log("Attempting to Generate Tactics for MasterChef");
    var [tacticsA, tacticsB] = await StratInstance.methods
      .generateTactics(
        farm.chef,
        farm.pid,
        0, //position of return value in vaultSharesTotal returnData array - have to look at contract and see
        "0x93f1a40b23000000", //vaultSharesTotal - includes selector and encoded call format
        "0xe2bbb15824000000", //deposit - includes selector and encoded call format
        "0x441a3e7024000000", //withdraw - includes selector and encoded call format
        "0x441a3e702f000000", //harvest - includes selector and encoded call format
        "0x5312ea8e20000000" //emergency withdraw - includes selector and encoded call format
      )
      .call();
    console.log("Tactics Generated!");
    console.log("TacticsA:", tacticsA);
    console.log("TacticsB:", tacticsB);
  }
  if (farm.type == "2") {
    console.log("Attempting to Generate Tactics for MiniChef");
    var [tacticsA, tacticsB] = await StratInstance.methods
      .generateTactics(
        farm.chef,
        farm.pid,
        0, //position of return value in vaultSharesTotal returnData array
        "0x93f1a40b23000000", //vaultSharesTotal - includes selector and encoded call format
        "0x8dbdbe6d24300000", //deposit - includes selector and encoded call format
        "0x0ad58d2f24300000", //withdraw - includes selector and encoded call format
        "0x18fccc7623000000", //harvest - includes selector and encoded call format
        "0x2f940c7023000000" //emergency withdraw - includes selector and encoded call format
      )
      .call();
    console.log("Tactics Generated!");
    console.log("TacticsA:", tacticsA);
    console.log("TacticsB:", tacticsB);
  }
  if (farm.type == "3") {
    console.log("Attempting to Generate Tactics for StakingRewards");
    var [tacticsA, tacticsB] = await StratInstance.methods
      .generateTactics(
        farm.chef,
        farm.pid,
        0, //position of return value in vaultSharesTotal returnData array
        "0x70a0823130000000", //vaultSharesTotal - includes selector and encoded call format
        "0xa694fc3a40000000", //deposit - includes selector and encoded call format
        "0x2e1a7d4d40000000", //withdraw - includes selector and encoded call format
        "0x3d18b91200000000", //harvest - includes selector and encoded call format
        "0xe9fad8ee00000000" //emergency withdraw - includes selector and encoded call format
      )
      .call();
    console.log("Tactics Generated!");
    console.log("TacticsA:", tacticsA);
    console.log("TacticsB:", tacticsB);
  }
  if (farm.type == "Other") {
    console.log("Attempting to Generate Tactics for PANCAKESWAP");
    var [tacticsA, tacticsB] = await StratInstance.methods
      .generateTactics(
        farm.chef,
        farm.pid,
        0, //position of return value in vaultSharesTotal returnData array
        "0x93f1a40b23000000", //vaultSharesTotal - includes selector and encoded call format
        "0xe2bbb15824000000", //deposit - includes selector and encoded call format
        "0x441a3e7024000000", //withdraw - includes selector and encoded call format
        "0xe2bbb1582f000000", //harvest - includes selector and encoded call format
        "0x5312ea8e20000000" //emergency withdraw - includes selector and encoded call format
      )
      .call();
    console.log("Tactics Generated!");
    console.log("TacticsA:", tacticsA);
    console.log("TacticsB:", tacticsB);
  }
  if (farm.type == "ApeSingle") {
    console.log("Attempting to Generate Tactics for ApeSingle");
    var [tacticsA, tacticsB] = await StratInstance.methods
      .generateTactics(
        farm.chef,
        farm.pid,
        0, //position of return value in vaultSharesTotal returnData array
        "0x93f1a40bf3000000", //vaultSharesTotal - includes selector and encoded call format
        "0x41441d3b40000000", //deposit - includes selector and encoded call format
        "0x1058d28140000000", //withdraw - includes selector and encoded call format
        "0x1058d281f0000000", //harvest - includes selector and encoded call format
        "0x5312ea8ef0000000" //emergency withdraw - includes selector and encoded call format
      )
      .call();
    console.log("Tactics Generated!");
    console.log("TacticsA:", tacticsA);
    console.log("TacticsB:", tacticsB);
  }
  if (farm.type == "PhotonSingleStake") {
    console.log("Attempting to Generate Tactics for PhotonSingleStake");
    var [tacticsA, tacticsB] = await StratInstance.methods
      .generateTactics(
        farm.chef,
        farm.pid,
        0, //position of return value in vaultSharesTotal returnData array
        "0x70a0823130000000", //vaultSharesTotal - includes selector and encoded call format
        "0xa694fc3a40000000", //deposit - includes selector and encoded call format
        "0xe9fad8ee00000000", //withdraw - includes selector and encoded call format
        "0x3d18b91200000000", //harvest - includes selector and encoded call format
        "0x2e1a7d4d40000000" //emergency withdraw - includes selector and encoded call format
      )
      .call();
  }
  if (farm.type == "0") {
    console.log("ERROR: FARM TYPE NOT RECOGNISED, CREATE CONFIG MANUALLY");
  }
  let deploymentConfig = await StratInstance.methods
    .generateConfig(
      tacticsA,
      tacticsB,
      farm.want,
      wantDust,
      farm.router,
      MagnetiteAddress,
      240,
      false,
      farm.earned,
      earnedDustArray
    )
    .call();
  console.log("Config Generated:", deploymentConfig);

  let gasEst = await VaultHealerInstance.methods
    .createVault(StratImplementationAddress, deploymentConfig)
    .estimateGas({ from: process.env.DEPLOYER_ADDRESS });
  console.log(gasEst);
  let txnData = await VaultHealerInstance.methods
    .createVault(StratImplementationAddress, deploymentConfig)
    .encodeABI();
  console.log("TXN DATA:", txnData);

  await signTxn(txnData, gasEst, VaultHealerAddress);
};

async function calcWantDust(want) {
  let val = await PriceGetterInstance.methods.getLPPrice(want, 18).call();
  let equalsTenCents = (1e17 / val) * 1e18;
  return Math.floor(Math.log2(equalsTenCents));
}

async function calcEDust(earned) {
  for (let i = 0; i < earned.length; i++) {
    let val = await PriceGetterInstance.methods
      .getLPPrice(earned[i], 18)
      .call();
    let equalsOneDollar = (1e18 / val) * 1e18;
    earnedDustArray.push(Math.floor(Math.log2(equalsOneDollar)));
  }
}
async function signTxn(txData, gasEst, _to) {
  console.log("signing txn");
  const signedTxn = await web3.eth.accounts.signTransaction(
    {
      from: process.env.DEPLOYER_ADDRESS,
      data: txData,
      to: _to,
      gas: gasEst,
    },
    process.env.MY_PRIVATE_KEY
  );
  const sentTxn = await web3.eth.sendSignedTransaction(
    signedTxn.rawTransaction as string
  );
  console.log("txn sent:", sentTxn.transactionHash);
  console.log("gas used:", sentTxn.gasUsed);
}
createVault(QuickSwap.WBTC_cxBTC);
