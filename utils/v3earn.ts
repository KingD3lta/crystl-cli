import { inputData } from "../src/inputData";
const ethers = require("ethers");
require("dotenv").config();

const StrategyAbi = require("../abi_files/Strategy_abi.json");
const VaultHealerAbi = require("../abi_files/VaultHealer_abi.json");
const RouterAbi = require("../abi_files/UniRouter_abi.json");
const ERC20Abi = require("../abi_files/ERC20_abi.json");

export const v3earn = async (network) => {
  let web3EndPoint: string;
  let vaultHealerAddr: string;

  if (network == "bsc") {
    let data = inputData.BSC;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
  }
  if (network == "cronos") {
    let data = inputData.Cronos;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
  }
  if (network == "polygon") {
    let data = inputData.Cronos;
    web3EndPoint = data.ENDPOINT;
    vaultHealerAddr = data.V3Vaults.VaultHealer;
  }
  const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);

  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);

  const dev = wallet.connect(provider);

  const VaultHealer = new ethers.Contract(vaultHealerAddr, VaultHealerAbi, dev);
  const minVid = 1;
  const numVaults = await VaultHealer.numVaultsBase();

  var vidArray = Array.from({ length: numVaults }, (_, i) => i + minVid);

  for (let i = 0; i < vidArray.length; i++) {
    var numMaximizers = (await VaultHealer.vaultInfo(vidArray[i]))
      .numMaximizers;
    console.log("Maximisers found:", numMaximizers);
    if(numMaximizers > 0){
    var maxiArray = Array.from(
      { length: numMaximizers },
      (_, j) => j + (minVid << 16) + 1
    );
    console.log("Earning Vids:", maxiArray);
    vidArray.shift();
    const maxiEarnTxn = await VaultHealer.earn(maxiArray);
    console.log("Maximisers Earned:", await maxiEarnTxn.hash)
  }
}
  console.log("Earning Vids:", vidArray);
  const convEarnTxn = await VaultHealer.earn(vidArray);
  console.log("Maximisers Earned:", await convEarnTxn.hash)
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
v3earn("bsc");
