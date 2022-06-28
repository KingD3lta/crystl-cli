import { inputData } from "./config/inputData";
import { ChainSpecificData } from "./config/types";
import { createInitData, createBoost } from "./createBoostPool";
import { initDev } from "./InitialiseWeb3";
import { WelcomeMenu } from "./Welcome";

const chalk = require("chalk");
var inquirer = require("inquirer");

export var Tokens;
export var Farms;
export var Routers;

export const CreateBoostMenu = async (CSD:ChainSpecificData) => {
  //QUESTIONS

  let CreateBoostOptions = [
    {
      type: "input",
      name: "VID",
      message: "What VID are we boosting?",
    },
    {
      type: "list",
      name: "EarnedToken",
      message: "What's the Token to be used for the boost?",
      choices: Object.keys(CSD.tokens),
    },
    {
      type: "input",
      name: "Duration",
      message:
        "How many days will the pool run for? [Whole Numbers only (._. )]",
    },
    {
      type: "input",
      name: "Delay",
      message: "How many hours should we wait before the pool goes active",
    },
    {
      type: "input",
      name: "TotalRewards",
      message:
        "How many tokens to be emitted over the period? [Please use whole numbers, don't worry about converting to wei (*_* )]",
    },
    {
      type: "input",
      name: "Decimals",
      message: "What is the decimals value of the earned token?",
    },
    {
      when(answers) {
        console.log("Raw Input Data:", answers);
      },
    },
    {
      type: "confirm",
      name: "Confirmed",
      message: "Please Confirm You're not an idiot <3",
    },
  ];

  let BoostReq = await inquirer.prompt(CreateBoostOptions).then((answers) => {
    return answers;
  });
  console.log("BoostReq", BoostReq);
  let InitData = await createInitData(
    CSD.network,
    BoostReq.EarnedToken,
    BoostReq.VID,
    BoostReq.Duration,
    BoostReq.Delay,
    BoostReq.TotalRewards,
    BoostReq.Decimals
  );
  ConfirmBoost(CSD.network, InitData, BoostReq.VID, CSD);
};

let ConfirmBoost = async (network, data, vid, CSD) => {
  const UserConfirmBoost = [
    {
      type: "confirm",
      name: "BoostPoolConfirm",
      message: "Please Confirm you'd like to deploy a Boost Pool",
    },
  ];

  let confirmation = await inquirer.prompt(UserConfirmBoost).then((answers) => {
    return answers.BoostPoolConfirm;
  });

  if (confirmation) {
    await createBoost(network, vid, data);
    await WelcomeMenu()
  }
  if(!confirmation){
    console.log(chalk.red("Let's Try That again!"))
    await CreateBoostMenu(CSD)
  }
};
