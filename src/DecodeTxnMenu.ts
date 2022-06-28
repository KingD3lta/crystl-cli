import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from "ethereum-multicall";
const web3 = require("Web3");
import { ABI, inputData } from "./config/inputData";
const ethers = require("ethers");
import { CAUTION_MSG, INFO_MSG, STATUS_MSG, WARN_MSG } from "./GetVaultConfig";

var inquirer = require("inquirer");

export const DecodeTxnMenu = async (network, dev) => {
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
  let txn = await dev.provider.getTransaction(TxnHash);

  let receipt = await txn.wait();

  let rawAddressArray = new Array();

  const Farm = receipt.to

  for (let i = 0; i < receipt.logs.length; i++) {
    for (let j = 0; j < receipt.logs[i].topics.length; j++) {
      let address = receipt.logs[i].address;
      if (ethers.BigNumber.from(address) > 4112) {
        rawAddressArray.push(address);
      }
      let strippedTopic = ethers.utils.hexStripZeros(receipt.logs[i].topics[j]);
      console.log(strippedTopic)
      if (strippedTopic.length == 42) {
        rawAddressArray.push(strippedTopic.toString(16));
      }
    }
  }

  let rawAddresses = new Set(rawAddressArray);

  STATUS_MSG("Scanning Addresses for ERC20 Tokens...");

  let [ERC20Addresses, VaultHelper] = await getERC20Bytes(
    rawAddresses,
    dev,
    network
  );

  INFO_MSG("Total ERC20s found: Potential ERC20s found");
  let NameStringArray = new Array();
  for (let i = 0; i < ERC20Addresses.length; i++) {
    let tokenName = await VaultHelper.getTokenName(ERC20Addresses[i]);
    if (tokenName != "") {
      NameStringArray.push(tokenName);
      INFO_MSG("Address:");
      console.log(ERC20Addresses[i]);
      INFO_MSG("Name:");
      console.log(NameStringArray[i]);
      STATUS_MSG("#*#*#*#*#*#*#*#*#*#*#*#*#*#");
    }
  }
  INFO_MSG("Total ERC20s found:");
  console.log(NameStringArray.length);
  const SelectTokenOptions = [
    {
      type: "list",
      choices: NameStringArray,
      name: "want",
      message: "Please Select the Want(Staked) Token "
    },
    {
      type: "list",
      choices: [{name: NameStringArray, value: NameStringArray}, "None"],
      name: "earned",
      message: "Please Select the Earned Token "
    }
  ];
  const [Want,Earned] = await inquirer.prompt(SelectTokenOptions).then((answers) => {
    return [answers.want,answers.earned];
  });

  console.log("Want:",Want,"Earned:",Earned, "Farm:",Farm)







};

export const getERC20Bytes = async (Addresses, dev, network) => {
  let rawAddressArray: string[] = Array.from(Addresses);
  const VaultHelper = new ethers.Contract(
    inputData[network].V3Vaults.VaultHelper,
    ABI.VaultHelper,
    dev
  );

  const ERC20Bytes = await VaultHelper._getIsERC20Bytes(rawAddressArray);
  console.log(ERC20Bytes);

  const IsContractResult: string = ERC20Bytes.slice(2, ERC20Bytes.length);
  let ERC20StatusArray = new Array();
  for (let i = 0; i < IsContractResult.length; i += 2) {
    let ERC20Status = parseInt(IsContractResult.slice(i, i + 2));
    ERC20StatusArray.push(ERC20Status);
  }
  let FinalisedContractAddresses: string[] = new Array();
  for (let i = 0; i < rawAddressArray.length; i++) {
    if (ERC20StatusArray[i] == true) {
      FinalisedContractAddresses.push(rawAddressArray[i]);
    }
  }
  return [FinalisedContractAddresses, VaultHelper];
};

export const tidyString = (string) => {
  const nullChar = /\\x00\\/g;
  let TidyString = string.replace(nullChar, "");
  return TidyString;
};
