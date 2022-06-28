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
  const txn = await provider.getTransaction(hash)
  const txnReceipt = await provider.getTransactionReceipt(hash)
  
  console.log("TXN:",txn)
  console.log("TXNRECEIPT:",txnReceipt)

};

getTransaction("CRONOS", users.stepdev, "0x351957c585c386a8da33355f81153feddd7c0222175d15440c1420ae2bb16e58");