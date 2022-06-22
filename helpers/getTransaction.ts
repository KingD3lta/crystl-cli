import { users, inputData } from "../src/config/inputData";
const ethers = require("ethers");
require("dotenv").config();

export const getTransaction = async (
  network: string,
  user: string,
  hash: string
) => {
  let data = inputData[network]
  const web3EndPoint = data.ENDPOINT

  const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);

  const txn = await provider.getTransactionReceipt(hash)
  
  console.log(txn)
  console.log()

};

getTransaction("cronos", users.stepdev, "0x91d8cb9a15f0bca52d7df0c9b4109a5cc232362b1a0837802dbe496d0686f006");