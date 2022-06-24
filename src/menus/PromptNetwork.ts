import { inputData } from "../../src/config/inputData";
import { ChainSpecificData } from "../../src/config/types";
import { INFO_MSG, STATUS_MSG } from "../GetVaultConfig";
const ethers = require("ethers");
var inquirer = require("inquirer");

export const PromptNetwork = async () => {
  const NetworkOptions = [
    {
      name: "NETWORK",
      type: "list",
      message: "Please Select a Network",
      choices: Object.keys(inputData),
    },
  ];
  let Network = await inquirer.prompt(NetworkOptions).then((answers) => {
    let selectedNetwork = answers.NETWORK;
    STATUS_MSG("Network Selected:");
    return selectedNetwork;
  });
  STATUS_MSG("Initalising Connection to requested chain...");
  const provider = new ethers.providers.JsonRpcProvider(
    inputData[Network].ENDPOINT
  );
  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
  const dev = wallet.connect(provider);
  INFO_MSG("Connected To Network: "+Network)
  STATUS_MSG("Successfully initialised Web3 connection, using address:");
  INFO_MSG(await dev.getAddress());

  STATUS_MSG("Initialising Chain Specific Data...");

  let data = inputData[Network];
  let CSD: ChainSpecificData = {
    V3: inputData[Network].V3Vaults,  
    network: Network,
    tokens: data.tokens,
    routers: data.routers,
    farms: data.farms,
    factories: data.factories,
  };
  return [CSD, dev];
};
