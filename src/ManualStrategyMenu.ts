import { ethers } from "ethers";
import { calcDust } from "../helpers/getDust";
import { ABI } from "./config/inputData";
import { ValidConfigData } from "./config/types";

var inquirer = require("inquirer");

export const ManualStrategyMenu = async (CSD, dev) => {
  const wantBOps = [Object.keys(CSD.tokens), "SingleTokenWant"];
  const ManualStratOptions = [
    {
      type: "list",
      name: "isLP",
      choices: [
        { name: "Single Staking Pool", value: false },
        { name: "LP Token Pool", value: true },
      ],
      message:
        "Are we building a vault around a Single Staking Pool, or an LP Token Pool?",
    },
    {
      type: "list",
      name: "wantA",
      choices: Object.keys(CSD.tokens),
      message: "Select the first token",
      filter: (val) => {
        return CSD.tokens[val];
      },
    },
    {
      type: "list",
      name: "wantB",
      choices: Object.keys(CSD.tokens),
      message: "Select the second token in the LP.",
      filter: (val) => {
        return CSD.tokens[val];
      },
      when: (answers) => answers.isLP,
    },
    {
      type: "list",
      name: "earned",
      choices: Object.keys(CSD.tokens),
      message: "Select the earned Token.",
      filter: (val) => {
        return CSD.tokens[val];
      },
    },
    {
      type: "list",
      name: "dualReward",
      choices: [
        { name: "YES", value: true },
        { name: "NO", value: false },
      ],
      message: "Does this farm earn multiple rewards?",
    },
    {
      type: "list",
      name: "earnedB",
      choices: Object.keys(CSD.tokens),
      message: "Select the second token in the LP.",
      filter: (val) => {
        return CSD.tokens[val];
      },
      when: (answers) => answers.dualReward,
    },
    {
      type: "list",
      name: "routerAndFactory",
      choices: Object.keys(CSD.routers),
      message:
        "What router are we using (*HINT* this will be the router for the LP, or the most liquid router for the token staked)",
      filter: (val) => {
        return [CSD.routers[val], CSD.factories[val]];
      },
    },
    {
      type: "list",
      name: "farm",
      choices: Object.keys(CSD.farms),
      message: "Please select the farm that this vault should deposit into.",
      filter: (val) => {
        return CSD.farms[val];
      },
    },
    {
      type: "input",
      name: "pid",
      message:
        "Please insert the numerical value of the poolID, if not used, use 999",
    },
  ];
  let CompletedConfig: ValidConfigData = {
    want: "",
    earned: [""],
    farm: "",
    pid: "",
    router: "",
  };

  const ConfigInput = await inquirer
    .prompt(ManualStratOptions)
    .then((answers) => {
      //we'll just store the vars we can here :)
      CompletedConfig.want = !answers.isLP ? answers.wantA : "";
      CompletedConfig.farm = answers.farm;
      CompletedConfig.router = answers.routerAndFactory[0];
      CompletedConfig.pid = answers.pid;
      CompletedConfig.earned = answers.dualReward
        ? [answers.earned]
        : [answers.earned, answers.earnedB];
      //and return the answers just incase we may need them later
      return answers;
    });
  // get want if want is LP :)
  if (CompletedConfig.want == "") {
    const Factory = new ethers.Contract(
      ConfigInput.routerAndFactory[1],
      ABI.UniV2Factory,
      dev
    );
    CompletedConfig.want = await Factory.getPair(
      ConfigInput.wantA,
      ConfigInput.wantB
    );
  } else {
    CompletedConfig.want = ConfigInput.wantA;
  }

  //fix up earned array and get dust
  return CompletedConfig
};
