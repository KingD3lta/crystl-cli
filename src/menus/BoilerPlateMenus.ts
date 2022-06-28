import { inputData, tacticsSetup } from "../../src/config/inputData";

var inquirer = require("inquirer");

export const BoilerPlatePrompt = async (msg = "") => {
  const options = [
    {
      type: "list",
      message: msg,
      name: "boilerPlatePrompt",
      choices: ["YES", "NO"],
      prefix: "",
    },
  ];
  const promptAnswer = await inquirer.prompt(options).then((answers) => {
    if (answers.boilerPlatePrompt == "YES") {
      return true;
    }
    if (answers.boilerPlatePrompt == "NO") {
      return false;
    }
  });
  return promptAnswer;
};

export const BoilerPlatePromptWithInput = async (msgPrompt = "", msgInput) => {
  const options = [
    {
      type: "list",
      message: msgPrompt,
      name: "boilerPlatePrompt",
      choices: ["YES", "NO"],
      prefix: "",
    },
    {
      type: "input",
      message: msgInput,
      name: "boilerPlateInput",
      when: (answers) => answers.boilerPlatePrompt == "YES",
    },
  ];
  const [promptAnswer, promptInput] = await inquirer
    .prompt(options)
    .then((answers) => {
      if (answers.boilerPlatePrompt == "YES") {
        return [true, answers.boilerPlateInput];
      } else {
        return [false, undefined];
      }
    });
  return [promptAnswer, promptInput];
};

export const PickAToken = async (msg = "", network) => {
  const options = [
    {
      type: "list",
      name: "PickAToken",
      choices: Object.keys(inputData[network].tokens),
      message: msg,
    },
  ];
  const SelectedToken = await inquirer.prompt(options).then((answers) => {
    return inputData[network].tokens[answers.PickAToken];
  });
  return SelectedToken;
};

export const PickARouter = async (msg = "", network) => {
  const options = [
    {
      type: "list",
      name: "PickARouter",
      choices: Object.keys(inputData[network].routers),
      message: msg,
    },
  ];
  const SelectedRouter = await inquirer.prompt(options).then((answers) => {
    return inputData[network].routers[answers.PickARouter];
  });
  return SelectedRouter;
};

export const PickATacticSetup = async () => {
  const options = [
    {
      type: "list",
      name: "PickATactic",
      choices: Object.keys(tacticsSetup),
    },
  ];
  const TacticSetupSelected = await inquirer.prompt(options).then((answers) => {
    return tacticsSetup[answers.PickATactic];
  });
  return TacticSetupSelected;
};

export const PickAStrategy = async (msg = "", network) => {
  const options = [
    {
      type: "list",
      name: "PickAStrategy",
      choices: Object.keys(inputData[network].V3Vaults.Strategies),
      message: msg,
    },
  ];
  const StrategyImplementation = await inquirer.prompt(options).then((answers) => {
    let StratImpl = {
      name: answers.PickAStrategy,
      address: inputData[network].V3Vaults.Strategies[answers.PickAStrategy]
    }
    return StratImpl;
  });
  return StrategyImplementation;
};