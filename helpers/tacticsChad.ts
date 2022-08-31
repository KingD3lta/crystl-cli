import { EncodedSelectors, ValidTactics, ValidTacticsCode} from "../src/config/types";

const chalk = require("chalk");
const web3 = require("Web3");
require("dotenv").config();

const sSha3 = web3.utils.soliditySha3;
const log = console.log;

export const tCode = {
  null: "0",
  bytesZero: "f",
  amount: "4",
  addrThis: "3",
  pid: "2",
};

export const encodeNPack = (
  plaintextInput: string,
  code: string
) => {
  let fullHash: string = sSha3(plaintextInput);
  let selector: string = fullHash.slice(0, 10);
  for (let j = 0; j < code.length; j++) {
    selector = selector + tCode[code[j]];
  }
  const encodedPaddedSelector: string = web3.utils.padRight(
    selector,
    16
  );
  return encodedPaddedSelector;
};

export const TacticsChad = (calls: EncodedSelectors, vstReturnPos) => {
  log(chalk.blue.bold(" . o . o . T a c t i c s C h a d . o . o . "));
  log(chalk.yellow.bold("Running for the following functions and arguments"));
  log(chalk.cyan(calls));

  const EncodedSelectors: ValidTactics = {
    vstReturn: vstReturnPos,
    vst: encodeNPack(calls.vst[0],calls.vst[1]),
    deposit: encodeNPack(calls.deposit[0],calls.deposit[1]),
    withdraw: encodeNPack(calls.withdraw[0],calls.withdraw[1]),
    harvest: encodeNPack(calls.harvest[0],calls.harvest[1]),
    SOS: encodeNPack(calls.sos[0],calls.sos[1]),
  }
  console.log(EncodedSelectors)
  return EncodedSelectors


};

/*
            //////////////////////////////////////
           ///  Acceptable Tactical Arguments ///
          //////////////////////////////////////

                "null" --- Represents the null character
                bytesZero --- 32 bytes 0s, if the argument = 0, use this. ** ex: to harvest certain MasterChef contracts, the call is deposit/withdraw(0)**
                amount --- Specified amount by user 
                addrThis --- Address of the strategy calling the function
                pid --- The specified pool id for the farm

*/

// example rawChad for your delectation (^._.^ )

// rawTacticsChad(
//   [
//     ["userInfo(uint256)", ["addrThis"]], //vaultSharesTotal - includes selector and encoded call format
//     ["deposit(uint256)", ["amount"]], //deposit - includes selector and encoded call format
//     ["withdraw(uint256)", ["amount"]], //withdraw - includes selector and encoded call format
//     ["deposit(uint256)", ["bytesZero"]], //harvest - includes selector and encoded call format
//     ["emergencyWithdraw(uint256)", []], //emergency withdraw - [0] = PlainText Selector and encoded call format
//   ]
// );
