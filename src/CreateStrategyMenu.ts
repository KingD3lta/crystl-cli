const chalk = require("chalk");
import { TacticsChad } from "../helpers/tacticsChad";
import { TacticsChadMenu } from "./TacticsChadMenu";
import { DecodeTxnMenu } from "./DecodeTxnMenu";
import {
  BoilerPlatePrompt,
  PickAStrategy,
  PickATacticSetup,
} from "./menus/BoilerPlateMenus";
import { inputData, tacticsSetup, ABI } from "./config/inputData";
import { ValidTactics } from "./config/types";
import { CreateBoostMenu, Routers } from "./CreateBoostMenu";
import {
  GenerateConfigFromDecodedTxn,
  INFO_MSG,
  STATUS_MSG,
} from "./GetVaultConfig";
import { PromptNetwork } from "./menus/PromptNetwork";
import { DeployStrategy } from "./DeployStrategy";
import { WelcomeMenu } from "./Welcome";

const ethers = require("ethers");

export const CreateStrategyMenu = async () => {
  let [CSD, dev] = await PromptNetwork(); //refactored :)

  let [StratImplementationAddress, StratImplementationName] =
    await PickAStrategy(
      "To begin, what Strategy Type would you like to use?",
      CSD.network
    );
  let EncodedSelectors: ValidTactics;

  let PreEncodedTactics = await BoilerPlatePrompt(
    "Would you like to use pre-encoded, ready to use tactics? Selecting no will initiate TacticsChad to encode selectors for you."
  );
  if (PreEncodedTactics) {
    EncodedSelectors = await PickATacticSetup();
    let FromTxn = await BoilerPlatePrompt(
      "Would you like to Attempt to Generate Info using a Deposit Transaction?"
    );
    if (FromTxn) {
      let [ConfigFromTxn, Token] = await DecodeTxnMenu(CSD.network, tacticsSetup, dev);
      return
      let [EncodedVaultConfig, V3] = await GenerateConfigFromDecodedTxn(
        CSD,
        ConfigFromTxn,
        EncodedSelectors,
        StratImplementationAddress,
        StratImplementationName,
        Token,
        dev
      );
      INFO_MSG("Config Successfully Generated!");
      if (
        await BoilerPlatePrompt(
          "Config Successfully Generated, would you like to deploy to the chain?"
        )
      ) {
        await DeployStrategy(
          EncodedVaultConfig,
          CSD.network,
          StratImplementationAddress,
          V3,
          dev
        );
      }
    } else {
      //todo (NOT FROM DEPOSIT TXN)
    }
  } else {
    EncodedSelectors = await TacticsChadMenu();
    //todo, add support for custom tactics
    STATUS_MSG("Support for Tactics Chad Coming soon ! ( * w *)");
    await WelcomeMenu();
  }
};
