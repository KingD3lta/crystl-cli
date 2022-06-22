const chalk = require("chalk");
import { v3earn } from "../tools/v3earn";
import { inputData } from "./config/inputData";
import { CreateBoostMenu, Routers } from "./CreateBoostMenu";
import { PromptNetwork } from "./promptNetwork";
import { WelcomeMenu } from "./Welcome";
var inquirer = require("inquirer");

export const EarnMenu = async () => {
    const Network = await PromptNetwork()
    console.log("Network:", Network.network)
    await v3earn(Network.network)
    await WelcomeMenu()
}