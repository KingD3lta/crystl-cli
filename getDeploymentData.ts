import { inputData } from "./src/inputData";
const Web3 = require("Web3");
const fs = require("fs");
require("dotenv").config();
const POLYGON_WEB3_PROVIDER = process.env.POLYGON_PRIVATE_RPC;
const CRONOS_WEB3_PROVIDER = process.env.CRONOS_RPC;
const BSC_WEB3_PROVIDER = process.env.BSC_RPC

const ERC20Abi = require("./abi_files/ERC20_abi.json");
const AmysStakingCoAbi = require("./abi_files/AmysStakingCo_abi.json");

//const web3 = new Web3(new Web3.providers.HttpProvider(POLYGON_WEB3_PROVIDER));
const web3 = new Web3(new Web3.providers.HttpProvider(CRONOS_WEB3_PROVIDER));

//let AmysStakingCoAddress = "0x29Bd88788F8e460C88D9F465F3509cB5623dFa89"; //polygon
//let AmysStakingCoAddress = "0x5714e10EdfBdB67b74A22370AE85da3e61362452"; //cronos
let AmysStakingCoAddress = "0x5CaA59B97a476A1769d27a844F7Be8da8fDc75a8" //bsc

let ChefScraperInstance = new web3.eth.Contract(
  AmysStakingCoAbi,
  AmysStakingCoAddress
);

let earnedDecimalsArray = new Array();
let wantNameArray = new Array();
let wantArray = new Array();
let allocPointArray = new Array();
let farmType;

async function scrapeFarm(masterChefAddress, earnedAddressArray) {
  let EarnedTokenAInstance = new web3.eth.Contract(
    ERC20Abi,
    earnedAddressArray[0]
  );
  let EarnedTokenADecimals = await EarnedTokenAInstance.methods
    .decimals()
    .call();
  earnedDecimalsArray.push(EarnedTokenADecimals);
  if (earnedAddressArray.length > 1) {
    let EarnedTokenBInstance = new web3.eth.Contract(
      ERC20Abi,
      earnedAddressArray[1]
    );
    let EarnedTokenBDecimals = await EarnedTokenBInstance.methods
      .decimals()
      .call();
    earnedDecimalsArray.push(EarnedTokenBDecimals);
  }
  console.log("Initialised Earned Token(s)")
  let calldata = await ChefScraperInstance.methods
    .getMCPoolData(masterChefAddress)
    .call();
  wantArray = calldata.lpTokens
  allocPointArray = calldata.allocPoint;
  farmType = calldata.chefType;
  await getTokenNames(wantArray);
}

async function getTokenNames(wantArray) {
  let lpTokenInfoPacked = await ChefScraperInstance.methods
    .lpTokenInfo(wantArray)
    .call();
  for (let i = 0; i < lpTokenInfoPacked.length; i++)
    if (lpTokenInfoPacked[i].isLPToken == true) {
      console.log("Getting Token Name for PID:",i)
      let unpacked0 = lpTokenInfoPacked[i].token0symbol.replace(/(00*0$)/i, "");
      let unpacked1 = lpTokenInfoPacked[i].token1symbol.replace(/(00*0$)/i, "");
      let token0 = hex_to_ascii(unpacked0);
      let token1 = hex_to_ascii(unpacked1);
      let LPName = token0 + "_" + token1;
      wantNameArray.push(LPName);
    } else {
      console.log("Single token detected, getting name")
      let unpacked = lpTokenInfoPacked[i].symbol.replace(/(00*0$)/i, "");
      let token = hex_to_ascii(unpacked);
      wantNameArray.push(token);
    }
}

async function createFarmConfig(
  masterChefAddress,
  wantArray,
  earnedAddressArray,
  routerAddress,
  farmName,
  farmType
) {
  console.log("Creating Farm Config")
  for (let i = 0; i < wantArray.length; i++) {
    if (allocPointArray[i] > 0) {
      console.log("Doing PID", i)
      let normalisedWantName = wantNameArray[i].replace(/\0/g, "");
      var farm = {
        chef: masterChefAddress,
        pid: i,
        want: wantArray[i],
        wantName: normalisedWantName,
        earned: earnedAddressArray,
        eDecs: earnedDecimalsArray,
        router: routerAddress,
        name: farmName,
        type: farmType,
      };
    }
    console.log("Writing To Storage:", i)
    writeToStorage(farm, farmName);
  }
}

async function writeToStorage(farm, farmName) {
  let wantName = farm.wantName;
  console.log("Saving:",wantName,"Config:",farm)
  farm = JSON.stringify(farm, null, 1);
  await fs.appendFile(
    "./configs/" + farmName + ".ts",
    wantName + ":" + farm + ",",
    function (err) {
      if (err) throw err;
      console.log("Saved!");
    }
  );
}

async function initaliseStorage(farmName) {
  await fs.appendFile(
    "./configs/" + farmName + ".ts",
    "export const" + " " + farmName + " = " + "{",
    function (err) {
      if (err) throw err;
      console.log("Initialised!");
    }
  );
}

function hex_to_ascii(str1) {
  var hex = str1.toString();
  var str = "";
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}

async function grabFarmDataAndSaveToStorage(
  masterChefAddress,
  earnedAddressArray,
  routerAddress,
  farmName
) {
  initaliseStorage(farmName)
  await scrapeFarm(masterChefAddress, earnedAddressArray);
  createFarmConfig(
    masterChefAddress,
    wantArray,
    earnedAddressArray,
    routerAddress,
    farmName,
    farmType
  );
}

// let tokens = Contracts.Polygon.tokens;
// let farms = Contracts.Polygon.farms;
// let routers = Contracts.Polygon.routers;
// let tokens = Contracts.Cronos.tokens;
// let farms = Contracts.Cronos.farms;
// let routers = Contracts.Cronos.routers;
let tokens = inputData.BSC.tokens
let routers = inputData.BSC.routers
let farms = inputData.BSC.farms


grabFarmDataAndSaveToStorage(
  farms.PancakeSwap,
  [tokens.CAKE],
  routers.PANCAKESWAP,
  "PancakeSwap"
);
