require("dotenv").config();
import { inputData, ABI } from "./config/inputData";
import { calcDust } from "../helpers/getDust";
import { PickARouter } from "./menus/BoilerPlateMenus";
const ethers = require("ethers");
require("dotenv").config();

const chalk = require("chalk");

export const STATUS_MSG = (msg) => {
  console.log(chalk.yellow("#*#*#*#*#*", msg, "*#*#*#*#*#"));
};
export const INFO_MSG = (msg) => {
  console.log(chalk.green(msg));
};
export const WARN_MSG = (msg) => {
  console.log(chalk.red.bold("*****", msg, "*****"));
};
export const CAUTION_MSG = (msg) => {
  console.log(chalk.red(msg));
};

export const GenerateConfigFromDecodedTxn = async (
  CSD,
  ConfigFromTxn,
  EncodedSelectors,
  StratImplementationAddress,
  StratImplementationName,
  Token,
  dev,
  
) => {
  STATUS_MSG("Initalising V3 Addresses");
  let V3 = inputData[CSD.network].V3Vaults;
  INFO_MSG("V3 Data:");
  console.log(V3);

  INFO_MSG("Config Info From Txn:");
  console.log(ConfigFromTxn);

  INFO_MSG("Encoded Selectors:");
  console.log(EncodedSelectors);

  const PriceGetter = new ethers.Contract(V3.PriceGetter, ABI.PriceGetter, dev);
  const Strategy = new ethers.Contract(StratImplementationAddress, ABI.Strategies[StratImplementationName], dev)

  const EarnedArray = ConfigFromTxn.earned.filter(token => token != undefined)  

  //Get Dust Amounts
  STATUS_MSG("Getting Dust For Want and Earned Tokens:");
  const { WantDust, EarnedDustArray } = await calcDust(
    PriceGetter,
    ConfigFromTxn.want,
    EarnedArray,
    Token
  );
  console.log("WantDust:", WantDust),
    console.log("EarnedDust:", EarnedDustArray);
  //  //Get Tactics
  STATUS_MSG("Getting Tactics Strings:");
  const [tacticsA, tacticsB] = await Strategy.generateTactics(
    ConfigFromTxn.farm,
    ConfigFromTxn.pid, //farmPid
    EncodedSelectors.vstReturn, //position of return value in vaultSharesTotal returnData array
    EncodedSelectors.vst, //vaultSharesTotal - includes selector and encoded call format
    EncodedSelectors.deposit, //deposit - includes selector and encoded call format
    EncodedSelectors.withdraw, //withdraw - includes selector and encoded call format
    EncodedSelectors.harvest, //harvest - includes selector and encoded call format
    EncodedSelectors.SOS //emergency withdraw - includes selector and encoded call format
  );
  console.log("TacticsA:", tacticsA)
  console.log("TacticsB:", tacticsB)
  const Router = await PickARouter("Please Select A Router That These LPs Originated from", CSD.network)
  const deploymentConfig = await Strategy.generateConfig(
    tacticsA,
    tacticsB,
    ConfigFromTxn.want,
    WantDust,
    CSD.routers[Router],
    V3.MagnetiteProxy,
    240,
    false,
    EarnedArray,
    EarnedDustArray
  );
  return [deploymentConfig, V3]
};

