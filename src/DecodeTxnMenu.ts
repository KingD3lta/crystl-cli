import { ABI, inputData } from "./config/inputData";
const ethers = require("ethers");
import { WARN_MSG } from "./GetVaultConfig";

var inquirer = require("inquirer");

export const DecodeTxnMenu = async (network, TacticsType, dev) => {
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
  
  console.log("Farm:", receipt.to);
  for (let i = 0; i < receipt.logs.length; i++) {
    for (let j = 0; j < receipt.logs[i].topics.length; j++) {
      let address = receipt.logs[i].address
      if ( ethers.BigNumber.from(address) > 4112){
      rawAddressArray.push(address)
      }
      let strippedTopic = ethers.utils.hexStripZeros(receipt.logs[i].topics[j]);
      if (strippedTopic.length == 42) {
        rawAddressArray.push(strippedTopic);
      }
    }
  }

  let Addresses = new Set(rawAddressArray);

  console.log(await getTokenNameFromAddress(Addresses, dev, network));

  return [];
};

export const getTokenNameFromAddress = async (Addresses, dev, network) => {
  let tokenAddressArray = Array.from(Addresses);
  const IsContract = new ethers.Contract(inputData[network].V3Vaults.IsContract, ABI.IsContract, dev)
  let IsContractArray = new Array()
  IsContractArray.push((await IsContract.checkIfContracts(tokenAddressArray)).slice)
  let Token = new ethers.Contract(tokenAddressArray[0], ABI.ERC20, dev);
  let NameArray = new Array();

  return NameArray;
};
