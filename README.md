# WELCOME TO THE CRYSTL COMMAND LINE INTERFACE (ALPHA, RELEASE v0.1)

***Important Notice: This repository is a work in progress. For now, please make use of the files in the root directory;***
>>createMaxi.ts
>>createVault.ts
and from /src you may use;
>>createBoostPool


#### Setting up an .env file
You'll want to save all important private data such as privateKeys, mnemonic phrases, RPC endpoints and other data we wouldn't want accidentally given away to bad bois. Please don't put your private key in any of the files that are published to GitHub, for the love of all that is good. 

You'll want to create a file in the root of the repository called .env, and fill out the relevant fields in this format;
>>DEPLOYER_ADDRESS = `your address`
>>MNEMONIC = your mnemonic phrase
>>MY_PRIVATE_KEY = your private key 

>>POLYGON_RPC = your polygon RPC endpoint (preferably private RPC)
>>CRONOS_RPC = your cronos RPC endpoint  (preferably private RPC)
>>BSC_RPC = your bsc RPC endpoint (preferably private RPC)

Please note, I'll be adding more support for more RPCs as time goes on, I'll keep the readme updated with supported chains. I recommend Moralis, Alchemy or getBlock for private end points! 

#### How to Use createMaxi/createVault scripts

- First, let's walk through setting up the correct data. There is a highly experiemntal script called getDeploymentData.ts that can be used on some MasterChefs to pull data from them automatically. These tend to have issues with larger chefs, as they'll save duplicates and require manual editing of the config files they create. This is **NOT** recommended unless you're fully aware of what you're doing :)

- The getDeploymentData script creates configs with the following format, and createVault/createMaxi take this object as an input. The sytnax is as follows; 
`WBNB_USDT: {
chef: "0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652",
pid: 13,
want: "0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE",
wantName: "WBNB_USDT",
earned: ["0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"],
eDecs: ["18"],
router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
name: "PancakeSwap",
type: "Other",
}`
Generally speaking, all you'll have to do is find the file that corresponds with the farm you want to deploy a vault from, copy and paste the last object, and change the pid, want, and wantName values to the necessary parameters.

After this, it's as simple as simple as navigating to the necessary file either createVault/createMaxi, ensuring the web3 endpoint is pointing at the right network, commenting out unneccesary constants and uncommenting the constants corresponding to the chain being used.

Finally, at the bottom of the file, you'll want to change the arguments to the farm you're looking to vault. For the above, it'd look something like this;
>>createVault(PancakeSwap.WBNB_USDT)/createMaxi(PancakeSwap.WBNB_USDT, targetVid) where targetVid = whatever vault you want to maximise to!

Then just run `npm run createVault` or `npm run createMaxi` in the console, and away you go! 

If you need to add additional functionality, you can create a new farm.type and add a conditional with it's relevant tactics. Please only do so if you know 100% what you're doing. Hoping to find a way to automate this in V2

#### How to Create A Boost Pool
This is also a bit of a work in progress with some UX features coming quite soon to make things a little easier.
It's important to note that rewards contracts such as BoostPools fall victim to inconsistent block times, so it's always a good idea to deploy these relatively close to their go live dates, as the timing variables are all approximations with some pretty steep assumptions taken. 

Without any further ado, here's how it works;

The CreateBoostPool function takes the following inputs as parameters. We'll go through these line by line so it'd evident what they correspond with.

`createBoostPool(
  network: string,
  reward: string,
  vid: number,
  duration: number, //in days 
  hoursToStart: number,
  totalRewards: number,
  decimals: number
)`

- network - string for the network being deployed to, for example, "bsc"
- reward - string with the address of the rewarded token
- vid - number representing vid to boost
- duration - number representing how long will the pool run for, roughly, in days
- hoursToStart - number representing the approximate number of hours before the boost becomes active
- totalRewards - number representing the total amount of rewards to be distributed over the period (no conversion to wei needed) 
- decimals - number representing the decimal value of the reward token, this is used in conversions as above, v important! 

This is pretty self explanatory, there are a few neat optimizations you can use to make life easier for you. For example, instead of tracking down the reward address every time, you may want to save it under inputData.ts under network.Tokens, for easier reference later! 

Once you have everything set up, just run `npm run boost` in the console, and away you go! 

Hope this helps, I will be adding to this project over time. Please be nice to this repo, it's still in Alpha, and be sure and let me know of any suggestions. Love: D <3



