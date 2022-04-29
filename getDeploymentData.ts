import { Contracts } from "./inputData";
const Web3 = require("Web3");
const fs = require("fs");
require("dotenv").config();
const WEB3_PROVIDER = process.env.PRIVATE_RPC;

const ERC20Abi = require("./abi_files/ERC20_abi.json");
const AmysStakingCoAbi = require("./abi_files/AmysStakingCo_abi.json");

const web3 = new Web3(new Web3.providers.HttpProvider(WEB3_PROVIDER));

let AmysStakingCoAddress = "0x31142627491adB55F076553975DC6e1b4a499CEF";

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
  let calldata = await ChefScraperInstance.methods
    .getMCPoolData(masterChefAddress)
    .call();
  wantArray = calldata.lpTokens;
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
      let unpacked0 = lpTokenInfoPacked[i].token0symbol.replace(/(00*0$)/i, "");
      let unpacked1 = lpTokenInfoPacked[i].token1symbol.replace(/(00*0$)/i, "");
      let token0 = hex_to_ascii(unpacked0);
      let token1 = hex_to_ascii(unpacked1);
      let LPName = token0 + "_" + token1;
      wantNameArray.push(LPName);
    } else {
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
  for (let i = 0; i < wantArray.length; i++) {
    if (allocPointArray[i] > 0) {
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
    writeToStorage(farm, farmName);
  }
}

function writeToStorage(farm, farmName) {
  let wantName = farm.wantName;
  farm = JSON.stringify(farm, null, 1);
  fs.appendFile(
    "./configs/" + farmName + ".ts",
    wantName + ":" + farm + ",",
    function (err) {
      if (err) throw err;
      console.log("Saved!");
    }
  );
}

function initaliseStorage(farmName) {
  fs.appendFile(
    "./configs/" + farmName + ".ts",
    "export const" + " " + farmName + " = " + "{",
    function (err) {
      if (err) throw err;
      console.log("Initialised!");
    }
  );
}

function finaliseStorage(farmName) {
  fs.appendFile("./configs/" + farmName + ".ts", "}", function (err) {
    if (err) throw err;
    console.log("Finalised!");
  });
}

function hex_to_ascii(str1) {
  var hex = str1.toString();
  var str = "";
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}
//todo, figure out how to add "}" to the end of the file lol.
async function grabFarmDataAndSaveToStorage(
  masterChefAddress,
  earnedAddressArray,
  routerAddress,
  farmName
) {
  initaliseStorage(farmName);
  await scrapeFarm(masterChefAddress, earnedAddressArray);
  createFarmConfig(
    masterChefAddress,
    wantArray,
    earnedAddressArray,
    routerAddress,
    farmName,
    farmType
  );
  finaliseStorage(farmName);
}

let tokens = Contracts.Polygon.tokens;
let farms = Contracts.Polygon.farms;
let routers = Contracts.Polygon.routers;

grabFarmDataAndSaveToStorage(
  farms.GREENHOUSE_MASTERCHEF,
  [tokens.GREEN],
  routers.GREENHOUSE,
  "GreenHouse"
);
