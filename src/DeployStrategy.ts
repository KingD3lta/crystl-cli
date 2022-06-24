import { BoilerPlatePromptWithInput } from "./menus/BoilerPlateMenus";
import { inputData, ABI } from "./config/inputData";
import { INFO_MSG, STATUS_MSG } from "./GetVaultConfig";
const ethers = require("ethers");

const VaultHealerInitCodeHash = "0x577cbdbf32026552c0ae211272febcff3ea352b0c755f8f39b49856dcac71019";

export const DeployStrategy = async (
  EncodedVaultConfig,
  network,
  StrategyImplementationAddress,
  V3,
  dev
) => {
  let [isMaximiser, TargetVid] = await BoilerPlatePromptWithInput(
    "Is This a Maximiser?",
    "What is the Target Vid this Maximiser should point to"
  );
  const VaultHealer = new ethers.Contract(V3.VaultHealer, ABI.VaultHealer, dev)
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
    const DeployVault = await VaultHealer.createVault(
      StrategyImplementationAddress,
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
