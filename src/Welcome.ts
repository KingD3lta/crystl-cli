import { getStorageAt } from "../helpers/getStorageAt";
import { DepositTransactionParseMenu } from "../tools/DepositTransactionParse";
import { CreateMenu } from "./CreateMenu";
import { ManagementMenu } from "./ManagementMenu";

const chalk = require("chalk");
var inquirer = require("inquirer");
var figlet = require("figlet");

const IntroMessage = async () => {
    figlet("crystl-cli ", { font: "3D-ASCII" }, function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log("")
    console.log(chalk.cyanBright.bold(data));
    console.log(chalk.greenBright.bold("Press Enter to start (* u *  )"))
  });
};

//QUESTIONS
export const WelcomeOptions = [
  {
    name: "welcome",
    type: "confirm",
    //message: "Welcome to the Crystl-CLI :) Press enter to start ( *_*)",
  },
  {
    type: "list",
    name: "Task",
    message: "What would you like to get up to today?",
    choices: ["Create Something", "Manage Stuff", "Fun Tools"],
  },
];

export const WelcomeMenu = async () => {
    await IntroMessage()
  let Task = await inquirer.prompt(WelcomeOptions).then((answers) => {
    return answers.Task;
  });
  if (Task == "Create Something") {
    console.log("What's cooking, Dev? ;)");
    await CreateMenu();
  }
  if (Task == "Manage Stuff") {
    console.log("Assistant", chalk.red.bold("TO"), "the regional manager!");
    await ManagementMenu();
  }
  if (Task == "Fun Tools") {
    await DepositTransactionParseMenu()
  }
};

WelcomeMenu();
