import { v3earn } from "../tools/v3earn";
import { PromptNetwork } from "./menus/PromptNetwork";
import { WelcomeMenu } from "./Welcome";

export const EarnMenu = async () => {
    const [Network,] = await PromptNetwork()
    console.log("Network:", Network.network)
    await v3earn(Network.network)
    await WelcomeMenu()
}