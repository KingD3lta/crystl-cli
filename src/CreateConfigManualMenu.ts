var inquirer = require("inquirer");

export const CreateConfigManualMenu = async (CSD) => {
  const CreateConfigOptions = [
    {
      type: "input",
      name: "farm",
      message: "Please Insert the Farm Address",
    },
    {
      type: "input",
      name: "pid",
      message: "Please Insert the PID, if not applicable, leave blank",
    },
    {
      type: "input",
      name: "want",
      message: "Please Insert the address of the staked token",
    },
    {
      type: "input",
      name: "earned",
      message: "Please insert the earned token address",
    },
    {
      type: "confirm",
      name: "isMultiEarn",
      message: "does this farm earn multiple tokens?",
    },
    {
      type: "input",
      name: "earnedB",
      message: "Please insert the second earned token's address",
      when: (answers) => answers.isMultiEarn == true,
    },
  ];
  const responses = await inquirer
    .prompt(CreateConfigOptions)
    .then((answers) => {
      if (answers.pid == "") {
        answers.pid = "999";
      }
      let FarmConfigInfo = {
          farm: answers.farm,
          pid: answers.pid,
          want: answers.want,
          earned: [answers.earned, answers.earnedB]
      }
      return FarmConfigInfo
    });
  return responses;
};
