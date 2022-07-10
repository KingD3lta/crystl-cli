const chalk = require("chalk");
import { TacticsChad } from "../helpers/tacticsChad";
import { TacticsChadMenu } from "./TacticsChadMenu";
import { GetConfFromTxnMenu } from "../tools/getConfigFromTxn";
import {
  BoilerPlatePrompt,
  PickATacticSetup,
} from "../tools/Menus/BoilerPlateMenus";
import { inputData, tacticsSetup } from "./config/inputData";
import { ValidTactics } from "./config/types";
import { CreateBoostMenu, Routers } from "./CreateBoostMenu";
import {
  CreateStratConfigFromTxn,
  INFO_MSG,
  SelectStrategy,
} from "./getDeploymentData";
import { PromptNetwork } from "./promptNetwork";
import { WelcomeMenu } from "./Welcome";
import { DeployStrategy } from "./DeployStrategy";
import { CreateConfigManualMenu } from "./CreateConfigManualMenu";
var inquirer = require("inquirer");

//type ChainSpecificData = { tokens, routers, farms };

//QUESTIONS
export const CreateOptions = [
  {
    type: "list",
    name: "Task",
    choices: ["Create Strategy", "Create Boost", "Create Pool"],
  },
];

export const CreateMenu = async () => {
  let CSD = await PromptNetwork();
  let CreateTask = await inquirer.prompt(CreateOptions).then((answers) => {
    return answers.Task;
  });

  if (CreateTask == "Create Strategy") {
    let EncodedSelectors: ValidTactics;

    let CustomTactics = await BoilerPlatePrompt(
      "Would you like to use custom tactics? (ie, for one time vaults on experimental farm contracts etc)"
    );
    let TacticsType: string
    if (CustomTactics) {
      let [Selectors, vstReturn] = await TacticsChadMenu();
      EncodedSelectors = TacticsChad(Selectors, vstReturn);
    } else {
      TacticsType = await PickATacticSetup();
      EncodedSelectors = tacticsSetup[TacticsType];
    }
    let FromTxn = await BoilerPlatePrompt(
      "Would you like to Attempt to Generate Info using a Deposit Transaction?"
    );
    if (FromTxn) {
      let StrategyType = await SelectStrategy(CSD.network);
      let ConfigFromTxn = await GetConfFromTxnMenu(CSD.network, TacticsType);

      let [EncodedVaultConfig, VaultHealer] = await CreateStratConfigFromTxn(
        CSD,
        ConfigFromTxn,
        EncodedSelectors,
        StrategyType
      );
      INFO_MSG(EncodedVaultConfig);
      if (
        await BoilerPlatePrompt(
          "Config Successfully Generated, would you like to deploy to the chain?"
        )
      ) {
        await DeployStrategy(EncodedVaultConfig, VaultHealer, CSD.network, StrategyType);
      }
    } else {
      let StrategyType = await SelectStrategy(CSD.network);
      let ManualConfig = await CreateConfigManualMenu(CSD)
      let [EncodedVaultConfig, VaultHealer] = await CreateStratConfigFromTxn(
        CSD,
        ManualConfig,
        EncodedSelectors,
        StrategyType
      );
      INFO_MSG(EncodedVaultConfig);
      if (
        await BoilerPlatePrompt(
          "Config Successfully Generated, would you like to deploy to the chain?"
        )
      ) {
        await DeployStrategy(EncodedVaultConfig, VaultHealer, CSD.network, StrategyType);
      }
    }
  }
  if (CreateTask == "Create Boost") {
    let CSD = await PromptNetwork();
    await CreateBoostMenu(CSD);
  }
  if (CreateTask == "Create Pool") {
    //CreatePoolMenu(Network)
  }
};
