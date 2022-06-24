import { CreateStrategyMenu } from "./CreateStrategyMenu"
import { CreateBoostMenu, Routers } from "./CreateBoostMenu";
import { PromptNetwork } from "./menus/PromptNetwork";
var inquirer = require("inquirer");


export const CreateMenu = async () => {
  const CreateOptions = [
    {
      type: "list",
      name: "Task",
      choices: ["Create Strategy", "Create Boost", "Create Pool"],
    },
  ];
  let CreateTask = await inquirer.prompt(CreateOptions).then((answers) => {
    return answers.Task;
  });

  if (CreateTask == "Create Strategy") {
    await CreateStrategyMenu()

  }
  if (CreateTask == "Create Boost") {
    let [CSD,] = await PromptNetwork();
    await CreateBoostMenu(CSD);
  }
  if (CreateTask == "Create Pool") {
    //CreatePoolMenu(Network)
  }
};
