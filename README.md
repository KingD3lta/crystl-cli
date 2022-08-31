# WELCOME TO THE CRYSTL COMMAND LINE INTERFACE (ALPHA, RELEASE v0.1)

***Important Notice: This repository is a work in progress***


#### Setting up an .env file
You'll want to save all important private data such as privateKeys, mnemonic phrases, RPC endpoints and other data we wouldn't want accidentally given away to bad bois. Please don't put your private key in any of the files that are published to GitHub, for the love of all that is good. 

You'll want to create a file in the root of the repository called .env, and fill out the relevant fields in this format;
>>DEPLOYER_ADDRESS = `your address`
>>MNEMONIC = your mnemonic phrase
>>MY_PRIVATE_KEY = your private key 

>>CHAIN_RPC = your  RPC endpoint (preferably private RPC)

### Motives

Crystl's V3 Vaulting Infrastructure is exceptionally interoperable, and has a lot of support for a lot of different types of yield contracts, however, with this level of interoperability comes a significant UX speed-bump. This CLI serves to obfuscate a lot of that complexity away and just allows the end user to create Vaults and Maximisers without having to know the ins and outs.

I'll give a brief overview of what goes into making a vault below. It's not nearly as verbose as what the contract's creators will be able to explain, but it aims to be as simple as possible.

Generally speaking, the reason that these vaults have as much interoperability as they do is their ability to be cheaply replicatable through EIP 1167 Minimal proxies, and intelligent packing. In order to get these vaults to talk to a variety of different farms, instead of relying on a traditional Interface method, we make use of a bespoke "Tactics" set up. 

Tactics essentially refer to byteststrings that are packed with farm-related variables that tell the vault how to interact with a given farm. You can find examples of formatted "encoded Selectors" within ./src/inputData.tacticsSetup. It includes the functions 4byte selector, accompanied by a hash nibble that corresponds with a given input, address(this), 32Bytes0, specified amount, so on so forth.

Obviously, this is pretty complicated to do, as it requires figuring out the 4bytes, the respective arguments, and then calling Strategy.generateTactics to get the byte string. That bytestring along with some other variables are fed into the generateConfig function which returns a bytes string that is used in createVault or createMaximizer to actually create the vault proxy. 

Did I bore you yet? Yes? Excellent, that means my motives weren't for nothing.

#### How to Use 

The following command line interface is a consistent work in progress for me, and serves as a piece of tooling to help with developer operations for the Crystl V3 Vaults Infrastructure.

Currently, the most well fleshed out tool is the DepositTxnParse tool that will take a transaction that corresponds with depositing funds into a MasterChef, MiniChef, StakingRewards or equivalent contract, and with minimal user input, creates a vaultConfig and deploys that vault to the chain of your choice.

I will be adding in tooling to support more manual input vault creation for edge cases. 

Another handy dandy tool that I have no plumbed in yet, but will be doing shortly is the TacticsChad. 

Chad is cool. He can take our plain, idiot-speak and turn it into encoded selectors to be used in the Tactics section of set up, eventually I will allow the user to either select from a list of pre-determined tactics or generate their own using Chad, this will allow any old user with at least a little bit of Smart Contract development knowledge to spin up a vault for some less ... boilerplate farms. 

All things in time of course.
 

