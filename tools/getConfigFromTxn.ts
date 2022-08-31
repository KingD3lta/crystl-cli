import { provider } from "../helpers/provider";
import {
  BoilerPlatePrompt,
  PickARouter,
  PickAToken,
} from "./Menus/BoilerPlateMenus";
import { inputData, ABI } from "../src/config/inputData";
const ethers = require("ethers");
import { ChainSpecificData } from "../src/config/types";
import { createInitData, createBoost } from "../src/createBoostPool";
import {
  INFO_MSG,
  STATUS_MSG,
  WARN_MSG,
  CAUTION_MSG,
} from "../src/getDeploymentData";
import { PromptNetwork } from "../src/promptNetwork";
import { WelcomeMenu } from "../src/Welcome";

const chalk = require("chalk");
var inquirer = require("inquirer");

export const GetConfFromTxnMenu = async (network, TacticsType) => {
  const confFromTxnOptions = [
    {
      type: "input",
      message: "Please Input the Txn hash of : DEPOSIT TO FARM",
      name: "TxnHash",
    },
  ];
  let TxnHash = await inquirer.prompt(confFromTxnOptions).then((answers) => {
    return answers.TxnHash;
  });

  let data = inputData[network];

  const web3EndPoint = data.ENDPOINT;

  const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);

  const txn = await provider.getTransaction(TxnHash);

  const receipt = await txn.wait();
  console.log(TacticsType);

  if (TacticsType == "MiniChef") {
    WARN_MSG(
      "PLEASE ENSURE [WANT] TOKEN PRINTED BELOW MATCHES INTENDED USER INPUT (? _ ?  )"
    );
    let farm = txn.to;
    let pid = 28 //receipt.logs[2].topics[2];
    let [wantConfirmed, wantAddress] = await GetAndVerifyTokenFromTxn(
      receipt.logs[1].address,
      provider
    );
    if (!wantConfirmed) {
      let want = await PickAToken(
        "Okay, Select the actual Want Address",
        network
      );
      wantAddress = inputData[network].tokens[want];
      wantConfirmed = true;
      INFO_MSG("WANT ADDRESS CONFIRMED");
    } else {
      INFO_MSG("WANT ADDRESS CONFIRMED");
    }

    let earned = await PickAToken(
      "Okay, Select the actual Earned Address",
      network
    );
    let earnedAddress = inputData[network].tokens[earned];

    let isMultiReward = await BoilerPlatePrompt(
      "Does This Farm Earn Multiple Rewards?"
    );
    if (isMultiReward) {
      var earnedB = await PickAToken(
        "Okay, Select the Second Earned Token",
        network
      );
    }
    let earnedBAddress = inputData[network].tokens[earnedB];

    if (wantConfirmed) {
      const Addresses = {
        farm: farm,
        pid: pid,
        want: wantAddress,
        earned: [earnedAddress, earnedBAddress],
      };
      console.log(Addresses);
      return Addresses;
    }
  }

  if (TacticsType == "StakingRewards") {
    WARN_MSG(
      "PLEASE ENSURE [WANT] TOKEN PRINTED BELOW MATCHES INTENDED USER INPUT (? _ ?  )"
    );
    let [wantConfirmed, wantAddress] = await GetAndVerifyTokenFromTxn(
      receipt.logs[1].address,
      provider
    );
    if (!wantConfirmed) {
      let want = await PickAToken(
        "Okay, Select the actual Want Address",
        network
      );
      wantAddress = inputData[network].tokens[want];
      wantConfirmed = true;
      INFO_MSG("WANT ADDRESS CONFIRMED");
    } else {
      INFO_MSG("WANT ADDRESS CONFIRMED");
    }

    let earned = await PickAToken(
      "Okay, Select the actual Earned Address",
      network
    );
    let earnedAddress = inputData[network].tokens[earned];

    let isMultiReward = await BoilerPlatePrompt(
      "Does This Farm Earn Multiple Rewards?"
    );
    if (isMultiReward) {
      let earnedB = await PickAToken(
        "Okay, Select the Second Earned Token",
        network
      );
      var earnedBAddress = inputData[network].tokens[earnedB];
    }

    if (wantConfirmed) {
      const Addresses = {
        farm: txn.to,
        pid: 999,
        want: wantAddress,
        earned: [earnedAddress, earnedBAddress],
      };
      return Addresses;
    }
  }
  
  if (TacticsType == "MasterChef" || "SaharaStaking") {
    const pid = receipt.logs[receipt.logs.length-2].topics[2];

    WARN_MSG(
      "PLEASE ENSURE [WANT] TOKEN PRINTED BELOW MATCHES INTENDED USER INPUT (? _ ?  )"
    );
    let [wantConfirmed, wantAddress] = await GetAndVerifyTokenFromTxn(
      receipt.logs[1].address,
      provider
    );
    if (!wantConfirmed) {
      const isPair = await BoilerPlatePrompt("is want an LP?");
      if (isPair) {
        const Factory = new ethers.Contract(
          inputData[network].factories[
            await PickARouter("Which Dex are these LPs from?", network)
          ],
          ABI.UniV2Factory, provider
        );
        const wantA = await PickAToken(
          "Please select the first token in the LP",
          network
        );
        const wantB = await PickAToken(
          "Please select the first token in the LP",
          network
        );
        console.log(Factory)
        console.log(
          "getting Pair for:",
          wantA,
          "address:",
          inputData[network].tokens[wantA],
          "and",
          wantB,
          "address:",
          inputData[network].tokens[wantB]
        );
        wantAddress = await Factory.getPair(
          inputData[network].tokens[wantA],
          inputData[network].tokens[wantB]
        );
        wantConfirmed = true;
        INFO_MSG("WANT ADDRESS CONFIRMED");
      } else {
        let want = await PickAToken(
          "Okay, Select the actual Want Address",
          network
        );
        wantAddress = inputData[network].tokens[want];
        wantConfirmed = true;
        INFO_MSG("WANT ADDRESS CONFIRMED");
      }
    } else {
      INFO_MSG("WANT ADDRESS CONFIRMED");
    }

    let earned = await PickAToken(
      "Okay, Select the actual Earned Address",
      network
    );
    let earnedAddress = inputData[network].tokens[earned];

    let isMultiReward = await BoilerPlatePrompt(
      "Does This Farm Earn Multiple Rewards?"
    );
    if (isMultiReward) {
      let earnedB = await PickAToken(
        "Okay, Select the Second Earned Token",
        network
      );
      var earnedBAddress = inputData[network].tokens[earnedB];
    }

    if (wantConfirmed) {
      const Addresses = {
        farm: txn.to,
        pid: pid,
        want: wantAddress,
        earned: [earnedAddress, earnedBAddress],
      };
      return Addresses;
    }
  }
  
  
};

export const GetAndVerifyTokenFromTxn = async (token: string, dev) => {
  const ERC20 = new ethers.Contract(token, ABI.ERC20, dev);
  try {
    const wantUniPair = new ethers.Contract(token, ABI.UniSwapV2Pair, dev);
    const underlyingAddrs = {
      token0: await wantUniPair.token0(),
      token1: await wantUniPair.token1(),
    };
    const wantERC20s = [
      await ERC20.attach(underlyingAddrs.token0),
      await ERC20.attach(underlyingAddrs.token1),
    ];
    const names = {
      token0: await wantERC20s[0].symbol(),
      token1: await wantERC20s[1].symbol(),
    };
    INFO_MSG(names.token0 + "/" + names.token1);
    return [await BoilerPlatePrompt(""), token];
  } catch {
    const wantERC20 = await ERC20.attach(token);
    const PlainTextName = await wantERC20.symbol();
    INFO_MSG(PlainTextName);
    return [
      await BoilerPlatePrompt("Verify Token is Relevant To Transaction"),
      token,
    ];
  }
};
