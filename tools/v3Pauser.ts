import { ABI, inputData } from "../src/config/inputData";
import { INFO_MSG, STATUS_MSG, WARN_MSG } from "../src/getDeploymentData";
import { initDev } from "../src/InitialiseWeb3";
import { PromptNetwork } from "../src/promptNetwork";

const ethers = require("ethers");
const inquirer = require("inquirer");


//INSERT THE VIDS TO PAUSE HERE ... make sure you clear this array when you're done with it for the love of god...
const vidsToPause: number [] = [0x01,0x03,0x04,0x060002]

export const PauserV3 = async () => {
  const CSD = await PromptNetwork();
  const dev = await initDev(CSD.network);
  const VaultHealerInterface: any = new ethers.utils.Interface(ABI.VaultHealer);


  INFO_MSG("Vids to be paused:");
  console.log(vidsToPause);

  let encodedPauseCallArray: string[] = new Array();

  for (let i = 0; i < vidsToPause.length; i++) {
    encodedPauseCallArray.push(
      VaultHealerInterface.encodeFunctionData("pause", [vidsToPause[i], false])
    );
  }
  INFO_MSG("ENCODED CALL DATA:");
  console.log(encodedPauseCallArray);

  STATUS_MSG("INITIALISING VAULT HEALER ...");
  const VaultHealer = new ethers.Contract(
    inputData[CSD.network].V3Vaults.VaultHealer,
    ABI.VaultHealer,
    dev
  );

  const ConfirmPauseInput = [
    {
      type: "confirm",
      name: "confirmPause",
      message: `PLEASE CONFIRM THAT YOU WOULD LIKE TO PAUSE THE FOLLOWING VIDS: ${vidsToPause}... PLEASE NOTE THAT THESE CANNOT BE UNPAUSED FOR AT LEAST 12 HOURS`,
    },
  ];
  const ConfirmPause = await inquirer
    .prompt(ConfirmPauseInput)
    .then((response) => {
      return response.confirmPause;
    });
  if (ConfirmPause) {
    const MulticallPause: any = await VaultHealer.multicall(encodedPauseCallArray, { gasPrice: await VaultHealer.provider.getGasPrice()});
    await MulticallPause.wait(1)
    INFO_MSG("Pause Transaction Hash:")
    console.log(MulticallPause.hash)
  } else {
    STATUS_MSG("Uh oh, lets try that again!");
    await PauserV3();
  }
};
