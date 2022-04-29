import { Contracts } from "./inputData";
const Web3 = require("Web3");
const ethers = require("ethers");
require("dotenv").config();
const WEB3_PROVIDER = process.env.PRIVATE_RPC;

const StrategyAbi = require("./abi_files/Strategy_abi.json");
const PriceGetterAbi = require("./abi_files/PriceGetter_abi.json");
const VaultHealerAbi = require("./abi_files/VaultHealer_abi.json");

//Farms
import { GreenHouse } from "./configs/GreenHouse";

const web3 = new Web3(new Web3.providers.HttpProvider(WEB3_PROVIDER));

let StratImplementationAddress = "0xd805F969fec0974C724818D0990ADcC030d3A380";
let PriceGetterAddress = "0x8b2d2279F722BbB38A32b5ddd050378ffdF28Ee4";
let MagnetiteAddress = "0x6B7D2f518aD592707DA6307eb40E28aA0bE2bADE";
let VaultHealerAddress = "0x8FcB6ce37D2a279A80d65B92AF9691F796CF1848";

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

async function createVault(farm) {
  let wantDust = await calcWantDust(farm.want);
  await calcEDust(farm.earned);
  if (farm.type == "1") {
    console.log("Attempting to Generate Tactics");
    var [tacticsA, tacticsB] = await StratInstance.methods
      .generateTactics(
        farm.chef,
        farm.pid,
        0, //position of return value in vaultSharesTotal returnData array - have to look at contract and see
        ethers.BigNumber.from("0x93f1a40b23000000"), //vaultSharesTotal - includes selector and encoded call format
        ethers.BigNumber.from("0xe2bbb15824000000"), //deposit - includes selector and encoded call format
        ethers.BigNumber.from("0x441a3e7024000000"), //withdraw - includes selector and encoded call format
        ethers.BigNumber.from("0x441a3e702f000000"), //harvest - includes selector and encoded call format
        ethers.BigNumber.from("0x5312ea8e20000000") //includes selector and encoded call format
      )
      .call();
  }
  if (farm.type == "2") {
    var [tacticsA, tacticsB] = await StratInstance.methods
      .generateTactics(
        farm.chef,
        farm.pid,
        0, //position of return value in vaultSharesTotal returnData array
        ethers.BigNumber.from("0x70a0823130000000"), //vaultSharesTotal - includes selector and encoded call format
        ethers.BigNumber.from("0xa694fc3a40000000"), //deposit - includes selector and encoded call format
        ethers.BigNumber.from("0x2e1a7d4d40000000"), //withdraw - includes selector and encoded call format
        ethers.BigNumber.from("0x3d18b91200000000"), //harvest - includes selector and encoded call format
        ethers.BigNumber.from("0xe9fad8ee00000000") //emergency withdraw - includes selector and encoded call format
      )
      .call();
  }
  if (farm.type == "3") {
    var [tacticsA, tacticsB] = await StratInstance.methods
      .generateTactics(
        farm.chef,
        farm.pid,
        0, //position of return value in vaultSharesTotal returnData array
        ethers.BigNumber.from("0x70a0823130000000"), //vaultSharesTotal - includes selector and encoded call format
        ethers.BigNumber.from("0xa694fc3a40000000"), //deposit - includes selector and encoded call format
        ethers.BigNumber.from("0x2e1a7d4d40000000"), //withdraw - includes selector and encoded call format
        ethers.BigNumber.from("0x3d18b91200000000"), //harvest - includes selector and encoded call format
        ethers.BigNumber.from("0xe9fad8ee00000000") //emergency withdraw - includes selector and encoded call format
      )
      .call();
  }
  if (farm.chefType == "3") {
    console.log("ERROR: FARM TYPE NOT RECOGNISED, CREATE CONFIG MANUALLY");
  }
  console.log("Tactics Generated:", tacticsA, tacticsB)
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
    console.log("Config Generated:", deploymentConfig)

  
  let gasEst = await VaultHealerInstance.methods
    .createVault(StratImplementationAddress, deploymentConfig)
    .estimateGas(
      {from: process.env.DEPLOYER_ADDRESS}
    );
    console.log(gasEst)
  let txnData = await VaultHealerInstance.methods
    .createVault(StratImplementationAddress, deploymentConfig)
    .encodeABI();
  console.log("TXN DATA:", txnData);
  
  await signTxn(txnData, gasEst, VaultHealerAddress);
}

async function calcWantDust(want) {
  let val = await PriceGetterInstance.methods.getLPPrice(want, 18).call();
  let equalsOneCent = (1e16 / val) * 1e18;
  return Math.floor(Math.log2(equalsOneCent));
}

async function calcEDust(earned) {
  for (let i = 0; i < earned.length; i++) {
    let val = await PriceGetterInstance.methods
      .getLPPrice(earned[i], 18)
      .call();
    let equalsOneCent = (1e16 / val[i]) * 1e18;
    earnedDustArray.push(Math.floor(Math.log2(equalsOneCent)));
  }
}
async function signTxn(txData, gasEst, _to) {
  console.log("signing txn")
  const signedTxn = await web3.eth.accounts.signTransaction(
    {
      from: process.env.DEPLOYER_ADDRESS, //todo set up testerAddress variables to secure deployer private keys
      to: _to,
      data: txData,
      gasPrice: web3.utils.toWei("5000", "gwei"),
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

createVault(GreenHouse.USDC_UST);
