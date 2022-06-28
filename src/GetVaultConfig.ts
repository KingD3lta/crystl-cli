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

export const GenerateVaultConfig = async (
  CSD,
  InputConfig,
  EncodedSelectors,
  StratImplementation,
  dev,
  
) => {
  STATUS_MSG("Initalising V3 Addresses");
  let V3 = inputData[CSD.network].V3Vaults;
  INFO_MSG("V3 Data:");
  console.log(V3);

  INFO_MSG("Config Info From Txn:");
  console.log(InputConfig);

  INFO_MSG("Encoded Selectors:");
  console.log(EncodedSelectors);
  const PriceGetter = new ethers.Contract(V3.PriceGetter, ABI.PriceGetter, dev);
  const Strategy = new ethers.Contract(StratImplementation.address, ABI.Strategies[StratImplementation.name], dev)
  const ERC20 = new ethers.Contract(InputConfig.want, ABI.ERC20, dev);

  const EarnedArray = InputConfig.earned.filter(token => token != undefined)  

  //Get Dust Amounts
  STATUS_MSG("Getting Dust For Want and Earned Tokens:");
  const [ WantDust, EarnedDustArray ] = await calcDust(
    PriceGetter,
    InputConfig.want,
    EarnedArray,
    ERC20
  );
  console.log("WantDust:", WantDust),
    console.log("EarnedDust:", EarnedDustArray);
  //  //Get Tactics
  STATUS_MSG("Getting Tactics Strings:");
  const [tacticsA, tacticsB] = await Strategy.generateTactics(
    InputConfig.farm,
    InputConfig.pid, //farmPid
    EncodedSelectors.vstReturn, //position of return value in vaultSharesTotal returnData array
    EncodedSelectors.vst, //vaultSharesTotal - includes selector and encoded call format
    EncodedSelectors.deposit, //deposit - includes selector and encoded call format
    EncodedSelectors.withdraw, //withdraw - includes selector and encoded call format
    EncodedSelectors.harvest, //harvest - includes selector and encoded call format
    EncodedSelectors.SOS //emergency withdraw - includes selector and encoded call format
  );
  console.log("TacticsA:", tacticsA)
  console.log("TacticsB:", tacticsB)
  const deploymentConfig = await Strategy.generateConfig(
    tacticsA,
    tacticsB,
    InputConfig.want,
    WantDust,
    InputConfig.router,
    V3.MagnetiteProxy,
    240,
    false,
    EarnedArray,
    EarnedDustArray
  );
  return [deploymentConfig, V3]
};

