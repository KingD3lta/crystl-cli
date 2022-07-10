import { syncASC } from "../helpers/syncASC";
import { provider } from "../helpers/provider";
const chalk = require("chalk");

import { inputData, ABI } from "./config/inputData";
import { ChainSpecificData, ValidTactics } from "../src/config/types";
import { generateConfig } from "../helpers/generateTactics";
import { getPairFor } from "../helpers/routerFuncs";
import { initDev } from "./InitialiseWeb3";
import { create } from "../helpers/create";
import { calcDust } from "../helpers/getDust";
import { PickARouter } from "../tools/Menus/BoilerPlateMenus";
import { string } from "yargs";
const ethers = require("ethers");
require("dotenv").config();
var inquirer = require("inquirer");


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

export const CreateStratConfigFromTxn = async (
  CSD,
  ConfigFromTxn,
  EncodedSelectors,
  StrategyType
) => {
  //Initiate Web3 Connection and Unpack Chain Specific Data into more managable object
  STATUS_MSG("Initialising Connection to");
  console.log(CSD.network);
  let Dev = await initDev(CSD.network);
  INFO_MSG("Successfully Established Connection to:");
  console.log(CSD.network);

  STATUS_MSG("Initalising V3 Addresses");
  let V3 = inputData[CSD.network].V3Vaults;
  INFO_MSG("V3 Data:");
  console.log(V3);

  INFO_MSG("Config Info From Txn");
  console.log(ConfigFromTxn);

  INFO_MSG("Encoded Selectors");
  console.log(EncodedSelectors);

  const VaultHealer = new ethers.Contract(V3.VaultHealer, ABI.VaultHealer, Dev);
  const Strategy = new ethers.Contract(V3.Strategies[StrategyType], ABI.Strategy, Dev);
  //const PriceGetter = new ethers.Contract(V3.PriceGetter, ABI.PriceGetter, Dev);
  const Token = new ethers.Contract(ConfigFromTxn.want, ABI.ERC20, Dev);

  const EarnedArray = ConfigFromTxn.earned.filter(token => token != undefined)  
  console.log(EarnedArray)

  //Get Dust Amounts
  STATUS_MSG("Getting Dust For Want and Earned Tokens:");
  const  {WantDust, EarnedDustArray}  = await calcDust(
    ConfigFromTxn.want,
    EarnedArray,
    Token,
    Dev
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
  console.log(
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
  )
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
  return [deploymentConfig, VaultHealer]
};

export const SelectStrategy = async (network) => {
  const StrategyOptions = [
    {
      type: "list",
      name: "Strategy",
      choices: Object.keys(inputData[network].V3Vaults.Strategies)
    }
  ]
  const Strategy = await inquirer.prompt(StrategyOptions).then((answers) => {
    return answers.Strategy
  })
  return Strategy
}

// export const CreateStratConfig = async (
//   //test: boolean = false,
//   CSD: ChainSpecificData,
//   StrategyConfig,
//   EncodedSelectors: ValidTactics
// ) => {
//   //Initiate Web3 Connection and Unpack Chain Specific Data into more managable object
//   STATUS_MSG("Initialising Connection to")
//   console.log(CSD.network)
//   let Dev = await initDev(CSD.network);
//   INFO_MSG("Successfully Established Connection to:")
//   console.log(CSD.network)

//   STATUS_MSG("Initalising V3 Addresses")
//   let V3 = inputData[CSD.network].V3Vaults
//   INFO_MSG("V3 Data:")
//   console.log(V3)

//   STATUS_MSG("Initalising User Input Addresses")
//   let Addresses = {
//     DEX: {factory: CSD.factories[StrategyConfig.LiquidityProvider], router: CSD.routers[StrategyConfig.LiquidityProvider]},
//     LPTokenA: CSD.tokens[StrategyConfig.TokenA],
//     LPTokenB: CSD.tokens[StrategyConfig.TokenB],
//     EarnedTokenA: CSD.tokens[StrategyConfig.EarnedTokensA],
//     EarnedTokenB: CSD.tokens[StrategyConfig.EarnedTokenB],
//     Farm: CSD.farms[StrategyConfig.Farm],
//   };
//   INFO_MSG("User Input Addresses:")
//   console.log( Addresses )

//   const VaultHealer = new ethers.Contract(V3.VaultHealer, ABI.VaultHealer, Dev)
//   const Strategy = new ethers.Contract(V3.Strategy, ABI.Strategy, Dev)
//   const AmysStakingCo = new ethers.Contract(V3.AmysStakingCo, ABI.AmysStakingCo, Dev)
//   const PriceGetter = new ethers.Contract(V3.PriceGetter, ABI.PriceGetter, Dev)
//   const Token = new ethers.Contract(Addresses.LPTokenA, ABI.ERC20, Dev)
//   const Factory = new ethers.Contract(Addresses.DEX.factory, ABI.UniV2Factory, Dev)

//   //Get Want Address from Input Tokens
//   //TODO Add functionality for SSPs ... shouldn't be too hard... hopefully
//   //if(ifSingleStake){}

//   const WantToken = await getPairFor([Addresses.LPTokenA,Addresses.LPTokenB], Factory);
//   STATUS_MSG("WantToken Initialised")
//   console.log(WantToken)

//   //Sync ASC
//   STATUS_MSG("Checking Sync Status from Amy's Staking Co")
//   await syncASC(Addresses.Farm, AmysStakingCo)
//   STATUS_MSG("SYNC SUCCESSFUL OR NOT NECESSARY!")

//   //Get Farm Pid
//   STATUS_MSG("Searching For PID from Farm:"+Addresses.Farm)
//   const FarmPid = await AmysStakingCo.findPool(Addresses.Farm, WantToken)
//   console.log(FarmPid[0].toString())

//   //Get Dust Amounts
//   STATUS_MSG("Getting Dust For Want and Earned Tokens:")
//    const {WantDust, EarnedDustArray} = await calcDust(PriceGetter, WantToken, [Addresses.EarnedTokenA,Addresses.EarnedTokenB],Token)
//    console.log("WantDust:",WantDust),
//    console.log("EarnedDust:",EarnedDustArray)
//   //Pack Earned Addresses into Array
//   const EarnedAddressArray = new Array()
//   EarnedAddressArray.push(Addresses.EarnedTokenA)
//   if(Addresses.EarnedTokenB != undefined){
//     EarnedAddressArray.push(Addresses.EarnedTokenB)
//   }

//   //Get Tactics
//   STATUS_MSG("Getting Tactics Strings:")
//   const [tacticsA, tacticsB] = await Strategy.generateTactics(
//     Addresses.Farm,
//     FarmPid[0], //farmPid
//     EncodedSelectors.vstReturn, //position of return value in vaultSharesTotal returnData array
//     EncodedSelectors.vst, //vaultSharesTotal - includes selector and encoded call format
//     EncodedSelectors.deposit, //deposit - includes selector and encoded call format
//     EncodedSelectors.withdraw, //withdraw - includes selector and encoded call format
//     EncodedSelectors.harvest, //harvest - includes selector and encoded call format
//     EncodedSelectors.sos //emergency withdraw - includes selector and encoded call format
//   );
//   const deploymentConfig = await Strategy.generateConfig(
//     tacticsA,
//     tacticsB,
//     WantToken,
//     WantDust,
//     Addresses.DEX.router,
//     V3.MagnetiteProxy,
//     240,
//     false,
//     EarnedAddressArray,
//     EarnedDustArray
//   );
//   //console.log("Config Generated:", deploymentConfig);
//   return [deploymentConfig, VaultHealer, V3.Strategy]
// };
