import { inputData } from "./config/inputData";
import { ChainSpecificData } from "./config/types";

const chalk = require("chalk");
var inquirer = require("inquirer");

const getNetworks = () => {
    return Object.keys(inputData);
  };

export const NetworkOptions = [
    {
        name: 'NETWORK',
        type: 'list',
        message: "Please Select a Network",
        choices: getNetworks()
    }
]

export const PromptNetwork = async () => { 
    let Network = await inquirer.prompt(NetworkOptions).then((answers) => {
         return answers.NETWORK
    })
    return await initialiseChainData(Network)

}

export const initialiseChainData = async (Network) => {
    let data = inputData[Network]
    let CSD: ChainSpecificData = {
        network: Network,
        tokens: data.tokens,
        routers: data.routers,
        farms: data.farms,
        factories: data.factories
    }
    return CSD
  };