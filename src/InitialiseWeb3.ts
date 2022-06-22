import { inputData } from "./config/inputData";
import { ChainSpecificData } from "./config/types";
const ethers = require("ethers");


export const initDev = async (Network) => {
  const provider = new ethers.providers.JsonRpcProvider(inputData[Network].ENDPOINT);
  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
  const dev = wallet.connect(provider);

  return dev
};