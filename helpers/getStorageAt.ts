import { inputData } from "../src/config/inputData";
import { ChainSpecificData } from "../src/config/types";
import { PromptNetwork } from "../src/menus/PromptNetwork";

const ethers = require("ethers");
var inquirer = require("inquirer");


export const getStorageAt = async () => {
    const [, dev]  = await PromptNetwork()
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


    const dataAtSlot = await dev.getStorageAt(address, slot)

    console.log(dataAtSlot)

 
}