const ethers = require("ethers");

export const provider = (web3EndPoint: any) => {
    const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);
  
    const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
  
    const dev = wallet.connect(provider);
    return dev;
  }