import { Console } from "console";
import { STATUS_MSG } from "../src/getDeploymentData";

const axios = require("axios").default;

export const CGTokenPrice = async (tokenAddress: string, network: string) => {
  let apiFormatChain: string =
    network == "POLYGON"
      ? "polygon-pos"
      : network == "BSC"
      ? "binance-smart-chain"
      : network.toLowerCase();
  let apiFormatAddress: string = network.toLowerCase()
  let price = await axios
    .get(
      "https://api.coingecko.com/api/v3/simple/token_price/" +
        apiFormatChain +
        "?contract_addresses=" +
        tokenAddress +
        "&vs_currencies=usd"
    )
    .then((response) => {
      return (response.data[tokenAddress.toLowerCase()]).usd;
    });
    return price
};
