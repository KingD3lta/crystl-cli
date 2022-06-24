const chalk = require("chalk");
import { TacticsChad } from "../helpers/tacticsChad";
import { tCode } from "../helpers/tacticsChad";
import { tacticsSetup } from "./config/inputData";
import { WARN_MSG, STATUS_MSG, CAUTION_MSG, INFO_MSG } from "./GetVaultConfig";
import {  EncodedArgs, EncodedSelectors } from "./config/types";
var inquirer = require("inquirer");

export const TacticsChadMenu = async () => {
  STATUS_MSG(
    "WELCOME TO TACTICS CHAD, LETS ENCRYPT SOME FUNCTION SELECTORS, FRIEND  (* w * ) "
  );
  WARN_MSG(
    "This software hashes your inputs AS TYPED"
  );
  WARN_MSG("it is important that you insert the function selectors:")
  CAUTION_MSG("* ACCURATELY *");
  CAUTION_MSG("* WITHOUT QUOTES *");
  CAUTION_MSG(
    " * UINT256 != UINT *"
  );
  CAUTION_MSG(" * NO SPACES BETWEEN ARGUMENTS *");

  const TacticsChadOptions = [
    {
      type: "list",
      name: "vstReturn",
      message: chalk.cyan(
        "When the function to get the user's balance is called, what position is the return data in"
      ),
      choices: ["0", "32", "64", "128", "Other"],
    },
    {
      type: "input",
      name: "custom vstReturn",
      message: "Please insert the return position manually, then",
      when: (answers) => answers.vstReturn == "Other",
    },
    {
      type: "input",
      name: "vst",
      message:
        "Please type the function selector for Vault Shares Total (Vault Balance) function on Farm Contract (example: userInfo(uint256,address)",
    },
    {
      type: "input",
      name: "deposit",
      message:
        "Insert the function selector for a deposit transaction on Farm Contract (example: deposit(uint256,uint256))",
    },
    {
      type: "input",
      name: "withdraw",
      message:
        "Insert the function selector for a withdraw transaction on Farm Contract (example: withdraw(uint256,uint256))",
    },
    {
      type: "input",
      name: "harvest",
      message:
        "Insert the function selector for a withdraw transaction on Farm Contract (example: withdraw(uint256,uint256) or harvest(uint256)",
    },
    {
      type: "input",
      name: "sos",
      message:
        "Insert the function selector for an Emergency Withdraw transaction on Farm Contract (example: emergencyWithdraw(uint256))",
    },
  ];
  const Selectors = await inquirer
    .prompt(TacticsChadOptions)
    .then((answers) => {
      INFO_MSG("User Definied Function Selectors with Arguments");
      return answers;
    });
 console.log(Selectors)
 const encodedArgs: EncodedArgs = {
  vst : await ArgSelectorMenu(Selectors.vst),
  dep : await ArgSelectorMenu(Selectors.deposit),
  wd : await ArgSelectorMenu(Selectors.withdraw),
  harv : await ArgSelectorMenu(Selectors.harvest),
  sos : await ArgSelectorMenu(Selectors.sos),
  
};

const vstReturn = Selectors.vstReturn

const SelectorWithArgs: EncodedSelectors  = {
    vst: [Selectors.vst, encodedArgs.vst],
    deposit: [Selectors.deposit, encodedArgs.dep],
    withdraw: [Selectors.withdraw, encodedArgs.wd],
    harvest: [Selectors.harvest, encodedArgs.harv],
    sos: [Selectors.sos, encodedArgs.sos],
}
return TacticsChad(Selectors, vstReturn)
}

export const ArgSelectorMenu = async (Selector) => {
    console.log("PLEASE INSERT THE ENCODED ARGUMENT FOR FUNCTION,",chalk.green(Selector),"IF DONE / NONE, CHOOSE \"null\"")
  let ArgArray: string[] = new Array();
  const ArgOptions = [
    {
      name: "arg",
      type: "list",
      message: "Please select the Argument to be used from the list",
      choices: Object.keys(tCode),
    },
  ];
  let Arg = await inquirer.prompt(ArgOptions).then((answers) => {
    return answers.arg;
  });
  ArgArray.push(Arg);
  while (Arg != "null") {
    Arg = await inquirer.prompt(ArgOptions).then((answers) => {
      return answers.arg;
    });
    if(Arg != "null"){
    ArgArray.push(Arg);
    }
  }
  console.log(ArgArray)
  return ArgArray;
};
