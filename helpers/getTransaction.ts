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
  
  console.log(txn)
  console.log(await txn.wait())

};

getTransaction("CRONOS", users.stepdev, "0x2c6580fa7d93a168d763f59aceebc19755e3074c914653c352d484e40df31467");