import { dedup } from "../helpers/DeDuplicate";
import { ABI, inputData } from "../src/config/inputData";
import { ChainSpecificData } from "../src/config/types";
import { INFO_MSG } from "../src/getDeploymentData";
import { initDev } from "../src/InitialiseWeb3";
import { PromptNetwork } from "../src/promptNetwork";

const ethers = require("ethers");
const inquirer = require("inquirer");
const axios = require("axios").default;

const Topics = {
  MasterChefDeposit:
    "0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15",
  MiniChefDeposit:
    "0x02d7e648dd130fc184d383e55bb126ac4c9c60e8f94bf05acdf557ba2d540b47",
  StakingRewardsDeposit:
    "0x9e71bc8eea02a63969f509818f2dafb9254532904319f9dbda79b67bd34a5f3d",
  ERC20Transfer:
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
};

export const DepositTransactionParseMenu = async () => {
  const CSD: ChainSpecificData = await PromptNetwork();
  const dev = await initDev(CSD.network);
  const ChainSpecificV3 = inputData[CSD.network].V3Vaults;
  console.log("DEV:",dev)

  const DepositTxnInput = [
    {
      type: "input",
      name: "hash",
      message: "Please Enter the Transaction Hash",
    },
  ];

  const TxnHash = await inquirer.prompt(DepositTxnInput).then((answers) => {
    return answers.hash;
  });

  const VaultHealer = new ethers.Contract(
    ChainSpecificV3.VaultHealer,
    ABI.VaultHealer,
    dev
  );
  const VaultHelper = new ethers.Contract(
    ChainSpecificV3.VaultHelper,
    ABI.VaultHelper,
    dev
  );
  console.log(VaultHealer.provider)

  let txn = await VaultHealer.provider.getTransaction(TxnHash);

  let receipt = await txn.wait(1);

  let FarmConfig = {
    farmAddr: undefined,
    pid: undefined,
    want: { address: undefined, price: undefined },
    earned: { address: [], price: [] },
    tactics: undefined,
  };

  //console.log("TXN:", txn);
  //console.log("Receipt:", receipt);
  let logs = receipt.logs;
  //console.log("RAW-LOGS", logs);
  let TokenAddressArray: string[] = new Array();

  logs.forEach((log) => {
    if (log.topics[0] == Topics.MasterChefDeposit) {
      FarmConfig.farmAddr = log.address;
      FarmConfig.pid = log.topics[2];
      FarmConfig.tactics = "MasterChef";
    }
    if (log.topics[0] == Topics.MiniChefDeposit) {
      FarmConfig.farmAddr = log.address;
      FarmConfig.pid = log.topics[2];
      FarmConfig.tactics = "MiniChef";
    }
    if (log.topics[0] == Topics.StakingRewardsDeposit) {
      FarmConfig.farmAddr = log.address;
      FarmConfig.pid = "999";
      FarmConfig.tactics = "MasterChef";
    }
    if (log.topics[0] == Topics.ERC20Transfer) {
      TokenAddressArray.push(log.address);
    }
  });
  TokenAddressArray = await dedup(TokenAddressArray);
  console.log(TokenAddressArray);
  for (let i = 0; i < TokenAddressArray.length; i++) {
    const TokenRelevancyAssignment = [
      {
        type: "confirm",
        name: "isRelevant",
        message: `We Found token ${await VaultHelper.getTokenName(
          TokenAddressArray[i]
        )} is this relevant to the vault?`,
      },
      {
        type: "list",
        choices: ["WANT", "EARNED"],
        name: "Relevancy",
        message: "What's the relevancy of this token?",
        when: (answers) => answers.isRelevant,
      },
    ];
    await inquirer.prompt(TokenRelevancyAssignment).then((answers) => {
      if (answers.Relevancy == "WANT") {
        FarmConfig.want.address = TokenAddressArray[i];
      }
      if (answers.Relevancy == "EARNED") {
        FarmConfig.earned.address.push(TokenAddressArray[i]);
      }
    });
  }
  const AdditionalTokenInputs = [
    {
      type: "confirm",
      name: "tokensMissed",
      message: "Did we miss any Earned Tokens?",
    },
    {
      type: "list",
      name: "earned",
      choices: Object.keys(inputData[CSD.network].tokens),
      when: (answers) => answers.tokensMissed,
      filter: (val) => {
        return inputData[CSD.network].tokens[val];
      },
    },
    {
      type: "confirm",
      name: "moreMissed",
      message: "Are there any additional earned Tokens?",
      when: (answers) => answers.tokensMissed,

    },
  ];
  await inquirer.prompt(AdditionalTokenInputs).then(async (answers) => {
    FarmConfig.earned.address.push(answers.earned);
    if (answers.moreMissed) {
      await inquirer.prompt(AdditionalTokenInputs).then(async (answers) => {
        FarmConfig.earned.address.push(answers.earned);
      });
    }
  });
  //ok, now lets get the prices. 


  console.log(FarmConfig);
};
