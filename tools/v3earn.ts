import { inputData, ABI } from "../src/config/inputData";
import { INFO_MSG } from "../src/getDeploymentData";
const ethers = require("ethers");
const chalk = require("chalk");
require("dotenv").config();

export const v3earn = async (network) => {
  let data = inputData[network];
  const web3EndPoint: string = data.ENDPOINT;
  const vaultHealerAddr: string = data.V3Vaults.VaultHealer;

  const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);

  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);

  const dev = wallet.connect(provider);

  const vidsToEarn = 8;

  const VaultHealer = new ethers.Contract(
    vaultHealerAddr,
    ABI.VaultHealer,
    dev
  );
  const minVid = 1;
  const numVaults = await VaultHealer.numVaultsBase();

  var vidArray = Array.from({ length: numVaults }, (_, i) => i + minVid);
  console.log(chalk.blue("Vid Array:", chalk.green(vidArray)));

  let gasPrice = await VaultHealer.provider.getGasPrice();
  INFO_MSG("Gas Price:");
  console.log(ethers.utils.parseUnits(gasPrice.toString(), "wei"));
  let nonce: number;

  for (let i = 0; i < vidArray.length; i++) {
    nonce = await VaultHealer.provider.getTransactionCount(dev.address);
    console.log(chalk.blue("Current Vid:", chalk.green(vidArray[i])));
    var numMaximizers = (await VaultHealer.vaultInfo(vidArray[i]))
      .numMaximizers;
    console.log("Maximisers found:", numMaximizers);
    if (numMaximizers > 0) {
      var maxiArray = Array.from(
        { length: numMaximizers },
        (_, j) => j + (vidArray[i] << 16) + 1
      );
      for(let j = 0; j< maxiArray.length; j+= vidsToEarn){
        let maxiEarnCallVids = maxiArray.slice(j, j + vidsToEarn)
        console.log("Earning Vids:", maxiEarnCallVids);
        const maxiEarnTxn = await VaultHealer.earn(maxiEarnCallVids, {
          gasLimit: 10000000,
          gasPrice: gasPrice,
          //nonce: nonce,
        });
        await maxiEarnTxn.wait(1);
        console.log(
          chalk.yellow("Maximisers Earned:"),
          chalk.cyan(await maxiEarnTxn.hash)
        );
      }

      }
  }
  for(let i = 0; i <vidArray.length; i+= vidsToEarn){
    let earnCallVids = vidArray.slice(i, i + vidsToEarn)
  console.log("Earning Vids:", earnCallVids);
  const convEarnTxn = await VaultHealer.earn(earnCallVids, {
    gasLimit: 10000000,
    gasPrice: gasPrice,
    //nonce: nonce,
  });
  await convEarnTxn.wait(1)
  console.log(
    chalk.yellow("Vaults Earned:"),
    chalk.cyan(await convEarnTxn.hash)
  );
  }
};

// export const vidsPrimed = async (network: string) => {
//   let web3EndPoint: string;
//   let vaultHealerAddr: string;

//   if (network == "bsc") {
//     let data = inputData.BSC;
//     web3EndPoint = data.ENDPOINT;
//     vaultHealerAddr = data.V3Vaults.VaultHealer;
//   }
//   if (network == "cronos") {
//     let data = inputData.Cronos;
//     web3EndPoint = data.ENDPOINT;
//     vaultHealerAddr = data.V3Vaults.VaultHealer;
//   }
//   if (network == "polygon") {
//     let data = inputData.Cronos;
//     web3EndPoint = data.ENDPOINT;
//     vaultHealerAddr = data.V3Vaults.VaultHealer;
//   }
//   const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);

//   const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);

//   const dev = wallet.connect(provider);

//   const VaultHealer = new ethers.Contract(vaultHealerAddr, VaultHealerAbi, dev);
//   let Strategy = new ethers.Contract(
//     await VaultHealer.strat(1),
//     StrategyAbi,
//     dev
//   );
//   const minVid = 1;
//   const numVaults = await VaultHealer.numVaultsBase();
//   var stratArray = new Array();
//   var maxiStratArray = new Array();

//   var vidArray = Array.from({ length: numVaults }, (_, i) => i + minVid);

//   for (let i = 0; i < vidArray.length; i++) {
//     var numMaximizers = (await VaultHealer.vaultInfo(vidArray[i]))
//       .numMaximizers;
//     var maxiArray = Array.from(
//       { length: numMaximizers },
//       (_, j) => j + (minVid << 16) + 1
//     );
//     const vaultStratAddr = await VaultHealer.strat(vidArray[i]);
//     stratArray.push(vaultStratAddr);
//     for (let x = 0; x < maxiArray.length; x++) {
//       const maxiStratAddr = await VaultHealer.strat(maxiArray[x]);
//       maxiStratArray.push(maxiStratAddr);
//       var vids = {
//         targetVid: vidArray[i],
//         strategyAddrs: stratArray,
//         maxiVids: maxiArray,
//         maxiStratAddrs: maxiStratArray,
//       };
//     }
//     await getVaultEarnings(vids, Strategy, dev);
//     await getMaxiEarnings(vids, Strategy, dev)
//   }
// };

// export const getVaultEarnings = async (vids, Strategy, dev) => {
//   //Vaults
//   for (var i = 0; i < vids.strategyAddrs.length; i++)
//     Strategy = await Strategy.attach(vids.strategyAddrs[i]);
//   let vaultConfigInfo = await Strategy.configInfo();
//   let earnedAddressArray = vaultConfigInfo.earned;
//   for (let j = 0; j < earnedAddressArray.length; j++) {
//     let Token = new ethers.Contract(earnedAddressArray[j], ERC20Abi, dev);
//     let balanceOfStrat = await Token.balanceOf(earnedAddressArray[j]);
//     let dust = vaultConfigInfo.earnedDust[j];
//     console.log(
//       "Balance of:",
//       earnedAddressArray[j],
//       ":",
//       balanceOfStrat.toString(),
//       "Dust:",
//       dust.toString()
//     );
//     if (balanceOfStrat.gt(dust)) {
//       console.log("Fuckin send it daddy!");
//       vidsToEarn.push(vids.targetVid(i));
//     }
//   }
// };
// export const getMaxiEarnings = async (vids, Strategy, dev) => {
//   for (var i = 0; i < vids.maxiStratAddrs.length; i++)
//     Strategy = await Strategy.attach(vids.maxiStratAddrs[i]);
//   let vaultConfigInfo = await Strategy.configInfo();
//   let earnedAddressArray = vaultConfigInfo.earned;
//   for (let j = 0; j < earnedAddressArray.length; j++) {
//     let Token = new ethers.Contract(earnedAddressArray[j], ERC20Abi, dev);
//     let balanceOfStrat = await Token.balanceOf(earnedAddressArray[j]);
//     let dust = vaultConfigInfo.earnedDust[j];
//     console.log(
//       "Balance of:",
//       earnedAddressArray[j],
//       ":",
//       balanceOfStrat.toString(),
//       "Dust:",
//       dust.toString()
//     );
//     if (balanceOfStrat.gt(dust)) {
//       console.log("Fuckin send it daddy!");
//       vidsToEarn.push(vids.maxiVids(i));
//     }
//   }
//   let vaultChefNPid = [
//     vaultConfigInfo.masterchef,
//     vaultConfigInfo.pid.toString(),
//   ];
//   console.log(vidsToEarn);
// };
//v3earn("CRONOS");
