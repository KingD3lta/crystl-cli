import { BoilerPlatePromptWithInput } from "../tools/Menus/BoilerPlateMenus";
import { inputData } from "./config/inputData";
import { INFO_MSG, STATUS_MSG } from "./getDeploymentData";
const ethers = require("ethers");

const VaultHealerInitCodeHash = "0x577cbdbf32026552c0ae211272febcff3ea352b0c755f8f39b49856dcac71019";

export const DeployStrategy = async (
  EncodedVaultConfig,
  VaultHealer,
  network,
  StrategyType
) => {
  let [isMaximiser, TargetVid] = await BoilerPlatePromptWithInput(
    "Is This a Maximiser?",
    "What is the Target Vid this Maximiser should point to"
  );
  console.log("IsMaximiser?", isMaximiser);
  if (isMaximiser) {
    const DeployMaximiser = await VaultHealer.createMaximizer(
      ethers.BigNumber.from(TargetVid),
      EncodedVaultConfig
    );
    const receipt = await DeployMaximiser.wait();
    STATUS_MSG("Vault Successfully Deployed at Txn:");
    INFO_MSG(DeployMaximiser.hash);
    STATUS_MSG("Fetching VID...");
    console.log("TXN RECEIPT:", receipt);
    INFO_MSG("VID: ");
    const vid = receipt.logs[1].topics[1];
    console.log(vid);
    INFO_MSG("Computing Address...");
    const proxyAddress = ethers.utils.getCreate2Address(
      VaultHealer.address,
      vid,
      VaultHealerInitCodeHash
    );
    console.log(proxyAddress);
  } else {
    console.log(
      inputData[network].V3Vaults.Strategies[StrategyType],
      {gasPrice: await VaultHealer.provider.getGasPrice()}
    );
    const DeployVault = await VaultHealer.createVault(
      inputData[network].V3Vaults.Strategies[StrategyType],
      EncodedVaultConfig,
      { gasPrice: await VaultHealer.provider.getGasPrice() }
    );
    const receipt = await DeployVault.wait();
    STATUS_MSG("Vault Successfully Deployed at Txn:");
    INFO_MSG(DeployVault.hash);
    STATUS_MSG("Fetching VID...");
    console.log("TXN RECEIPT:", receipt);
    INFO_MSG("VID: ");
    const vid = receipt.logs[1].topics[1];
    console.log(vid);
    INFO_MSG("Computing Address...");
    const proxyAddress = ethers.utils.getCreate2Address(
      VaultHealer.address,
      vid,
      VaultHealerInitCodeHash
    );
    console.log(proxyAddress);
  }
};
