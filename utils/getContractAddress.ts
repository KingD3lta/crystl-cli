import { users, inputData } from "../src/inputData";
const ethers = require("ethers");
require("dotenv").config();

export const getContractAddress = async (
  network: string,
  user: string,
  incrementNonceBy: number = 0
) => {
  let web3EndPoint: string;

  if (network == "bsc") {
    let data = inputData.BSC;
    web3EndPoint = data.ENDPOINT;
  }
  if (network == "cronos") {
    let data = inputData.Cronos;
    web3EndPoint = data.ENDPOINT;
  }
  if (network == "polygon") {
    let data = inputData.Polygon;
    web3EndPoint = data.ENDPOINT;
  }

  const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);

  const nonce =
    (await provider.getTransactionCount(users.stepdev)) + incrementNonceBy;

  const derivedContractAddress: string = await ethers.utils.getContractAddress({
    from: user,
    nonce: nonce,
  });
  console.log("User Address:", user);
  console.log("Nonce Requested:", nonce);
  console.log("Derived Contract Address", derivedContractAddress);

  return derivedContractAddress;
};

getContractAddress("polygon", users.stepdev);
