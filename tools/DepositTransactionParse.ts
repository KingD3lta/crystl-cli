import { CGTokenPrice } from "../helpers/CGAPICalls";
import { dedup } from "../helpers/DeDuplicate";
import { autoCalcDust } from "../helpers/getDust";
import { ABI, inputData, tacticsSetup } from "../src/config/inputData";
import { ChainSpecificData, ValidTactics } from "../src/config/types";
import { INFO_MSG, STATUS_MSG, WARN_MSG } from "../src/getDeploymentData";
import { initDev } from "../src/InitialiseWeb3";
import { PromptNetwork } from "../src/promptNetwork";
import { PickARouter, PickAStrat, PriceInput } from "./Menus/BoilerPlateMenus";

const ethers: any = require("ethers");
const inquirer: any = require("inquirer");

const VaultHealerInitCodeHash: string =
  "0x577cbdbf32026552c0ae211272febcff3ea352b0c755f8f39b49856dcac71019";

const Topics: any = {
  MasterChefDeposit:
    "0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15",
  MiniChefDeposit:
    "0x02d7e648dd130fc184d383e55bb126ac4c9c60e8f94bf05acdf557ba2d540b47",
  StakingRewardsDeposit:
    "0x9e71bc8eea02a63969f509818f2dafb9254532904319f9dbda79b67bd34a5f3d",
  ERC20Transfer:
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  VaultHealerAddVault:
    "0x1ecf2341fc12558807d7b9a2e67d8ce3d4b39f91d372b9b4b9282ffd96fbe5a8",
};

export const DepositTransactionParseMenu = async () => {
  const CSD: ChainSpecificData = await PromptNetwork();
  const dev = await initDev(CSD.network);
  const ChainSpecificV3: any = inputData[CSD.network].V3Vaults;

  const DepositTxnInput: any[] = [
    {
      type: "input",
      name: "hash",
      message: "Please Enter the Transaction Hash",
    },
  ];

  const TxnHash: string = await inquirer
    .prompt(DepositTxnInput)
    .then((answers) => {
      return answers.hash;
    });

  const VaultHealer: any = new ethers.Contract(
    ChainSpecificV3.VaultHealer,
    ABI.VaultHealer,
    dev
  );
  const TokenDataGetter: any = new ethers.Contract(
    ChainSpecificV3.TokenDataGetter,
    ABI.TokenDataGetter,
    dev
  );

  let txn: any = await VaultHealer.provider.getTransaction(TxnHash);

  let receipt: any = await txn.wait(1);

  let FarmConfig: any = {
    farmAddr: undefined,
    pid: undefined,
    want: { address: undefined, dust: undefined },
    earned: { addresses: new Array(), dusts: new Array() },
    tactics: undefined,
  };
  let logs: any[] = receipt.logs;
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

  //lets process all those ERC20s we found...

  for (let i = 0; i < TokenAddressArray.length; i++) {
    let TokenData: any = await TokenDataGetter.getTokenData(
      TokenAddressArray[i]
    );

    const TokenRelevancyAssignment: any[] = [
      {
        type: "confirm",
        name: "isRelevant",
        message: `We Found token ${TokenData.name} is this relevant to the vault?`,
      },
      {
        type: "list",
        choices: ["WANT", "EARNED"],
        name: "Relevancy",
        message: "What's the relevancy of this token?",
        when: (answers) => answers.isRelevant,
      },
    ];
    await inquirer.prompt(TokenRelevancyAssignment).then(async (answers) => {
      //process relevancy responses
      if (answers.Relevancy == "WANT") {
        FarmConfig.want.address = TokenAddressArray[i];
        if (TokenData.token0Balance != 0) {
          //this signifies that the want Token has underlying tokens (ie. is a UniLP) so we'll process it accordingly.
          let lp0Price: number;
          try {
            //first we'll try fetch the data from CoinGecko, but some tokens aren't listed...
            let lp0Price: number = await CGTokenPrice(TokenData.token0, CSD.network);
            FarmConfig.want.dust = await autoCalcDust(
              (lp0Price *
                Math.pow(10, TokenData.token0Decimals) *
                TokenData.token0Balance *
                2) /
                TokenData.totalSupply,
              TokenData.decimals,
              true
            );
          } catch {
            //if we get a 404 or other error, we're going to process the token0 pricing manually
            WARN_MSG(
              "COULD NOT FETCH THE TOKENS PRICE FROM COINGECKO API, YOU WILL NEED TO INPUT MANUALLY!"
            );
            lp0Price = await PriceInput(TokenData.token0Name);
            FarmConfig.want.dust = await autoCalcDust(
              (lp0Price *
                Math.pow(10, TokenData.token0Decimals) *
                TokenData.token0Balance *
                2) /
                TokenData.totalSupply,
              TokenData.decimals,
              true
            );
          }
        } else {
          // if want is single token
          try {
            //try coin gecko api call to fetch price
            FarmConfig.want.dust = await autoCalcDust(
              (await CGTokenPrice(TokenAddressArray[i], CSD.network)) *
                Math.pow(10, TokenData.decimals),
              TokenData.decimals,
              true
            );
          } catch {
            // failing that, manual input is required
            WARN_MSG(
              "COULD NOT FETCH THE TOKENS PRICE FROM COINGECKO API, YOU WILL NEED TO INPUT MANUALLY!"
            );
            FarmConfig.want.dust = await autoCalcDust(
              (await PriceInput(TokenData.name)) *
                Math.pow(10, TokenData.decimals),
              TokenData.decimals,
              true
            );
          }
        }
      }
      if (answers.Relevancy == "EARNED") {
        // if the token is earned, this is a bit simpler, we'll push its address into the array
        FarmConfig.earned.addresses.push(TokenAddressArray[i]);
        try {
          //try to get data from CG again
          FarmConfig.earned.dusts.push(
            await autoCalcDust(
              (await CGTokenPrice(TokenAddressArray[i], CSD.network)) *
                Math.pow(10, TokenData.decimals),
              TokenData.decimals,
              false
            )
          );
        } catch {
          // failing that, usuer must manually input price of earned, which is normalised and stored in earned.prices[]
          WARN_MSG(
            "COULD NOT FETCH THE TOKENS PRICE FROM COINGECKO API, YOU WILL NEED TO INPUT MANUALLY!"
          );
          FarmConfig.earned.dusts.push(
            await autoCalcDust(
              (await PriceInput(TokenData.name)) *
                Math.pow(10, TokenData.decimals),
              TokenData.decimals,
              false
            )
          );
        }
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
    if (answers.tokensMissed) {
      FarmConfig.earned.addresses.push(answers.earned);
      let TokenData: any = await TokenDataGetter.getTokenData(answers.earned);
      try {
        //try to get data from CG again
        FarmConfig.earned.dusts.push(
          await autoCalcDust(
            (await CGTokenPrice(answers.earned, CSD.network)) *
              Math.pow(10, TokenData.decimals),
            TokenData.decimals,
            false
          )
        );
      } catch {
        // failing that, usuer must manually input price of earned, which is normalised and stored in earned.prices[]
        WARN_MSG(
          "COULD NOT FETCH THE TOKENS PRICE FROM COINGECKO API, YOU WILL NEED TO INPUT MANUALLY!"
        );

        FarmConfig.earned.dusts.push(
          await autoCalcDust(
            (await PriceInput(TokenData.name)) *
              Math.pow(10, TokenData.decimals),
            TokenData.decimals,
            false
          )
        );
      }
      if (answers.moreMissed) {
        await inquirer.prompt(AdditionalTokenInputs).then(async (answers) => {
          FarmConfig.earned.addresses.push(answers.earned);
          try {
            //try to get data from CG again
            FarmConfig.earned.dusts.push(
              autoCalcDust(
                (await CGTokenPrice(answers.earned, CSD.network)) *
                  Math.pow(10, TokenData.decimals),
                TokenData.decimals,
                false
              )
            );
          } catch {
            // failing that, usuer must manually input price of earned, which is normalised and stored in earned.prices[]
            WARN_MSG(
              "COULD NOT FETCH THE TOKENS PRICE FROM COINGECKO API, YOU WILL NEED TO INPUT MANUALLY!"
            );
            FarmConfig.earned.dusts.push(
              await autoCalcDust(
                (await PriceInput(TokenData.name)) *
                  Math.pow(10, TokenData.decimals),
                TokenData.decimals,
                false
              )
            );
          }
        });
      }
    }
  });

  INFO_MSG(
    "Congrats! We've successfully created the following data from the deposit txn provided:"
  );
  console.log(FarmConfig);

  // now we're going to generate Tactics bytestrings, we'll start by initialising an instance of the users input strategy
  let userSelectedStrategy: string = await PickAStrat(
    "Please Select the Strategy Used to create this Vault",
    CSD.network
  );

  const Strategy = new ethers.Contract(
    ChainSpecificV3.Strategies[userSelectedStrategy],
    ABI.Strategy,
    dev
  );
  // //and also creating an object that contains function selectors, using the Tactics setup derived from the deposit txn
  // //should probably add some additional functionality here to override and use TacticsChad, but alas, time will tell.

  const EncodedSelectors: ValidTactics = tacticsSetup[FarmConfig.tactics];

  // //next we'll call generateTactics on the Strategy

  const [tacticsA, tacticsB] = await Strategy.generateTactics(
    FarmConfig.farmAddr,
    FarmConfig.pid,
    EncodedSelectors.vstReturn,
    EncodedSelectors.vst,
    EncodedSelectors.deposit,
    EncodedSelectors.withdraw,
    EncodedSelectors.harvest,
    EncodedSelectors.SOS
  );

  //lets just log this so you can be super impressed with how smort you are
  INFO_MSG("TACTICS BYTESTRINGS SUCCESSFULLY GENERATED:");
  console.log("TacticsA:", tacticsA);
  console.log("TacticsB", tacticsB);
  // //Unfortunately there's no 100% reliable way to get router just yet, so we'll rely on user input for now.
  let Router = await PickARouter(
    "Please Select a Router that WANT token originates from, and will be used for swaps",
    CSD.network
  );
  //Might as well just log the router as well!
  INFO_MSG("YOU HAVE SELECTED THE FOLLOWING ROUTER:");
  console.log(Router);

  //now that we have tacticsA and tacticsB, we can begin generating the vault's config.
  const DeploymentConfig: string = await Strategy.generateConfig(
    tacticsA,
    tacticsB,
    FarmConfig.want.address,
    FarmConfig.want.dust,
    CSD.routers[Router],
    ChainSpecificV3.MagnetiteProxy,
    240,
    false,
    FarmConfig.earned.addresses,
    FarmConfig.earned.dusts
  );
  INFO_MSG("wow dev, great work! Here's your config");
  console.log(DeploymentConfig);

  const VaultTypeInput: any[] = [
    {
      type: "list",
      name: "vaultType",
      message:
        "Please Specify whether this will be a regular Vault or a Maximiser",
      choices: ["Vault", "Maximiser"],
    },
    {
      type: "input",
      name: "targetVid",
      message:
        "Please insert the targetVid of this vault (the vault in which rewards generated by this one will be deposited",
      when: (answers) => answers.VaultType == "Maximiser",
    },
  ];
  await inquirer.prompt(VaultTypeInput).then(async (response) => {
    if (response.vaultType == "Vault") {
      let VaultDeploy: any = await VaultHealer.createVault(
        ChainSpecificV3.Strategies[userSelectedStrategy],
        DeploymentConfig
      );
      STATUS_MSG("TRANSACTION SUCCESSFULLY SUBMITTED WITH HASH...");
      console.log(VaultDeploy.hash);
      STATUS_MSG("AWAITING CONFIRMATION ON CHAIN");
      let CompletedDeploy: any = await VaultDeploy.wait(1);
      //now that the deploy is complete, lets get the vid and address nice and easily.
      STATUS_MSG("Getting Vid from Creation logs and computing address");
      let VaultDeployLogs = CompletedDeploy.logs;
      VaultDeployLogs.forEach((log) => {
        if (log.topics[0] == Topics.VaultHealerAddVault) {
          let deployedVid = log.topics[1];
          let deployedAddress = ethers.utils.getCreate2Address(
            VaultHealer.address,
            deployedVid,
            VaultHealerInitCodeHash
          );
          INFO_MSG("DEPLOYED NEW VAULT AT VID:");
          console.log(deployedVid);
          INFO_MSG("AND PROXY ADDRESS:");
          console.log(deployedAddress);
        }
      });
    }

    if (response.VaultType == "Maximser") {
      let MaxiDeploy: any = await VaultHealer.createVault(
        response.targetVid,
        DeploymentConfig
      );
      STATUS_MSG("TRANSACTION SUCCESSFULLY SUBMITTED WITH HASH...");
      console.log(MaxiDeploy.hash);
      STATUS_MSG("AWAITING CONFIRMATION ON CHAIN");
      let CompletedDeploy: any = await MaxiDeploy.wait(1);
      //now that the deploy is complete, lets get the vid and address nice and easily.
      STATUS_MSG("Getting Vid from Creation logs and computing address");
      let MaxiDeployLogs = CompletedDeploy.logs;
      MaxiDeployLogs.forEach((log) => {
        if (log.topics[0] == Topics.VaultHealerAddVault) {
          let deployedVid = log.topics[1];
          let deployedAddress = ethers.utils.getCreate2Address(
            VaultHealer.address,
            deployedVid,
            VaultHealerInitCodeHash
          );
          INFO_MSG("DEPLOYED NEW MAXIMISER AT VID:");
          console.log(deployedVid);
          INFO_MSG("AND PROXY ADDRESS:");
          console.log(deployedAddress);
        }
      });
    }
  });
};
