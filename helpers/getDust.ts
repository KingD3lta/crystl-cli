import { ABI } from "../src/config/inputData";
import { INFO_MSG } from "../src/getDeploymentData";

const ethers = require("ethers");
var inquirer = require("inquirer");

export const autoCalcDust = async (
  price: number,
  decimals: any,
  isWant: boolean
) => {
  // for calculating dust with prices already determined
  if (isWant) {
    let tenCentsWorth =
      (Math.pow(10, decimals) / price) * Math.pow(10, decimals - 1);
      console.log("TEN CENTS WORTH:", tenCentsWorth)
      console.log("DUST:",Math.floor(Math.log2(tenCentsWorth)))
    return Math.floor(Math.log2(tenCentsWorth));
  } else {
    console.log(decimals.toNumber())
    let aDollarWorth = (Math.pow(10, decimals) / price) * Math.pow(10, decimals);
    console.log("A DOLLAR WORTH:",aDollarWorth)
    console.log("DUST:",Math.floor(Math.log2(aDollarWorth)))
    return Math.floor(Math.log2(aDollarWorth));
  }
};

export const calcDust = async (
  wantAddr: any,
  earnedAddrArray: any[],
  Token: any,
  dev
) => {
  //for manual Dust Calculations that rely on user input for token prices.
  let UniPair = new ethers.Contract(wantAddr, ABI.UniSwapV2Pair, dev);

  console.log(earnedAddrArray);
  let EarnedDustArray = new Array();
  let WantDust: number;
  const TokenPrices = [
    {
      type: "list",
      name: "wantIsLP",
      choices: ["YES", "NO"],
      message: "Is the want token an LP Token?",
      filter: (val) => (val == "YES" ? true : false),
    },
    {
      type: "input",
      name: "wantSinglePrice",
      message:
        "Please insert the price (in usd) of token0 in the LP, or if it's a single token, its price",
    },
    {
      type: "input",
      name: "earnedPrice",
      message: "Please insert the price (in usd) of earned",
    },
    {
      type: "input",
      name: "earnedBPrice",
      message: "Please insert the price (in usd) of the second earned token",
      when: earnedAddrArray[1] != undefined,
    },
  ];

  const answers = await inquirer.prompt(TokenPrices).then(async (answers) => {
    return answers;
  });
  if (answers.wantIsLP) {
    let LPDecimals = await UniPair.decimals();
    let t0Addr = await UniPair.token0();
    let LPTotalSupply = await UniPair.totalSupply();
    let LPBalanceOfT0;
    Token = Token.attach(t0Addr);
    let t0Decimals = await Token.decimals();
    if (t0Decimals < 18) {
      LPBalanceOfT0 =
        (await Token.balanceOf(wantAddr)) *
        Math.pow(10, LPDecimals - t0Decimals);
    } else {
      LPBalanceOfT0 = await Token.balanceOf(wantAddr);
    }
    let LPPrice =
      (answers.wantSinglePrice * Math.pow(10, LPDecimals) * LPBalanceOfT0 * 2) /
      LPTotalSupply;

    let tenCentsWorth =
      (Math.pow(10, LPDecimals) / LPPrice) * Math.pow(10, LPDecimals - 1);
    console.log("Ten Cents Worth:", tenCentsWorth);

    WantDust = Math.floor(Math.log2(tenCentsWorth));
  } else {
    Token = await Token.attach(wantAddr);
    let wantDecimals = await Token.decimals();
    let tenCentsWorth =
      (Math.pow(10, wantDecimals) /
        (answers.wantSinglePrice * Math.pow(10, wantDecimals))) *
      Math.pow(10, wantDecimals - 1);
    WantDust = Math.floor(Math.log2(tenCentsWorth));
  }
  INFO_MSG("Dust Log for staked token is:");
  console.log(WantDust);
  if (earnedAddrArray.length < 1) {
    console.log("no earned token");
    return { WantDust, EarnedDustArray };
  } else {
    for (let i = 0; i < earnedAddrArray.length; i++) {
      Token = await Token.attach(earnedAddrArray[i]);
      let earnedDecimals = await Token.decimals();
      let aDollarWorth = Math.pow(10, earnedDecimals) / answers.earnedPrice;
      if (i == 1) {
        aDollarWorth = Math.pow(10, earnedDecimals) / answers.earnedBPrice;
      }
      EarnedDustArray.push(Math.floor(Math.log2(aDollarWorth)));
    }
  }
  INFO_MSG("Dust Log for earned token is:");
  console.log(EarnedDustArray);
  return { WantDust, EarnedDustArray };
};
