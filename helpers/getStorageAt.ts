import { inputData } from "../src/config/inputData";
import { PromptNetwork } from "../src/promptNetwork";

const ethers = require("ethers");
var inquirer = require("inquirer");


export const getStorageAt = async () => {
    const network = await PromptNetwork()
    const options = [
        { 
            type: "input",
            name: "address",
            message: "Enter the Address who's storage we're calling",
        },
        {
            type: "input",
            name: "slot",
            message: "Enter the storage slot to retreive"
        }
    ]
    const [address, slot] = await inquirer.prompt(options).then((answers) => {
        return [answers.address, answers.slot]
    })
    const web3EndPoint = inputData[network.network].ENDPOINT

    const provider = new ethers.providers.JsonRpcProvider(web3EndPoint);

    const dataAtSlot = await provider.getStorageAt(address, slot)

    console.log(dataAtSlot)

 
}