import { ABI, inputData } from "./config/inputData";
import { ChainSpecificData } from "./config/types";
import { initDev } from "./InitialiseWeb3";
import { PromptNetwork } from "./promptNetwork";

const ethers = require("ethers");
const inquirer = require("inquirer");

export const CreateBoostPool = async () => {
  const CSD: ChainSpecificData = await PromptNetwork();
  const dev: any = await initDev(CSD.network);

  const VaultHealer: any = new ethers.Contract(
    inputData[CSD.network].V3Vaults.VaultHealer,
    dev
  );
};

export const getBoostPoolInitData = async (network, dev) => {
  const BoostPool: any = new ethers.Contract(
    inputData[network].V3Vaults.BoostPool,
    ABI.BoostPool,
    dev
  );

  const InitDataCreationOptions = [
    {
      type: "confirm",
      message: `Would you like to use the deployer address ${dev.address} to fund this Boost Pool `,
      name: "payFromDeployer",
    },
    {
      type: "input",
      message:
        "Please enter the address that will be funding this pool. NOTE: Ensure you have approved reward tokens to be spent on BoostPool",
      name: "payer",
      when: (answers: any) => !answers.payFromDeployer,
    },
    {
      type: "list",
      choices: Object.keys(inputData[network].tokens),
      name: "rewardAddress",
      filter: (val: string) => {
        return inputData[network].tokens[val];
      },
    },
    {
      type: ""
    }
  ];
};
