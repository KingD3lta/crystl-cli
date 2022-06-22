const chalk = require("chalk");
import { inputData } from "./config/inputData";
import { CreateBoostMenu, Routers } from "./CreateBoostMenu";
import { EarnMenu } from "./EarnMenu";
var inquirer = require("inquirer");


export const ManagementMenu = async () => { 
    const ManagerOptions = [
        {
            name: "ManagementTask",
            type: "list",
            message: "Whatcha Managing?",
            choices: ["Earn Vaults","Pause Vaults"]
        }
    ]
    const ManagementTask = await inquirer.prompt(ManagerOptions).then((answers) => {
        return answers.ManagementTask
    })

    if(ManagementTask == "Earn Vaults"){
        await EarnMenu()
    }
}