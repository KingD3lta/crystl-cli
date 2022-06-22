require("dotenv").config();
import { ValidTactics } from "./types";

export const ABI = {
  //V3 Vault ABIs
  VaultHealer: require("./abi_files/VaultHealer_abi.json"),
  Strategy: require("./abi_files/Strategy_abi.json"),
  BoostPool: require("./abi_files/BoostPool_abi.json"),
  //VaultGetter: require("./abi_files/VaultGetterV3_abi.json"),
  //Periphery Helpers
  PriceGetter: require("./abi_files/PriceGetter_abi.json"),
  AmysStakingCo: require("./abi_files/AmysStakingCoV2_abi.json"),
  //External Contracts
  ERC20: require("./abi_files/ERC20_abi.json"),
  UniV2Factory: require("./abi_files/UniV2Factory_abi.json"),
  UniSwapV2Pair: require("./abi_files/UniswapV2Pair_abi.json"),
  UniswapV2Router: require("./abi_files/UniRouter_abi.json"),
  MasterChef: require("./abi_files/MasterChef_abi.json"),
}

export const users = {
  stepdev: process.env.DEPLOYER_ADDRESS,
};

export const tacticsSetup = {
  MasterChef:  {
    vstReturn: "0",
    vst: "0x93f1a40b23000000",
    deposit: "0xe2bbb15824000000",
    withdraw: "0x441a3e7024000000",
    harvest: "0x441a3e702f000000",
    SOS: "0x5312ea8e20000000",
  },
  MiniChef: {
    vstReturn: "0",
    vst: "0x93f1a40b23000000",
    deposit: "0x8dbdbe6d24300000",
    withdraw: "0x0ad58d2f24300000",
    harvest: "0x18fccc7623000000",
    SOS: "0x2f940c7023000000",
  },
  StakingRewards: {
    vstReturn: "0",
    vst: "0x70a0823130000000",
    deposit: "0xa694fc3a40000000",
    withdraw: "0x2e1a7d4d40000000",
    harvest: "0x3d18b91200000000",
    SOS: "0xe9fad8ee00000000",
  },
  PancakeChef: {
    // maybe one day I'll find a chef like it.
    vstReturn: "0",
    vst: "0x93f1a40b23000000",
    deposit: "0xe2bbb15824000000",
    withdraw: "0x441a3e7024000000",
    harvest: "0xe2bbb1582f000000",
    SOS: "0x5312ea8e20000000",
  },
  MiniChefSingle: {
    // to-do verify this is compatible with MiniChef SSPs
    vstReturn: "0",
    vst: "0x93f1a40bf3000000",
    deposit: "0x41441d3b40000000",
    withdraw: "0x1058d28140000000",
    harvest: "0x1058d281f0000000",
    SOS: "0x5312ea8ef0000000",
  },
  stakingRewardsSingleStake: {
    // to-do verify this is compatible with other SR-SSPs
    vstReturn: "0",
    vst: "0x70a0823130000000",
    deposit: "0xa694fc3a40000000",
    withdraw: "0xe9fad8ee00000000",
    harvest: "0x3d18b91200000000",
    SOS: "0x2e1a7d4d40000000",
  },
  StakingPool: {
    vstReturn: "0",
    vst: "0x51d70bc430000000",
    deposit: "0xb6b55f2540000000",
    withdraw: "0x2e1a7d4d40000000",
    harvest: "0xb6b55f25f0000000",
    SOS: "0x5312ea8e00000000",
  },
  customSetup: {
    vstReturn: "",
    vst: "",
    deposit: "",
    withdraw: "",
    harvest: "",
    SOS: "",
  },
};

export const inputData = {
  POLYGON: {
    ENDPOINT: process.env.POLYGON_RPC,
    V3Vaults: {
      VaultHealer: "0xA1b26B5eC4a73A6a632bE1f45FfC628518c0AFD6",
      Strategies: { Strategy: "0x57Ff558daA818B36af32A031ac92836aFd53426c", StrategyQuick: "0xb076E4b9dd071955F02fC5e388BFf3ac3bCCe5b7" },
      BoostPool: "0xbB854D2DD8ED40ACBa41f6c3eC6b59A1a6A70089",
      MagnetiteProxy: "0x6c9102aDfE6903A383aD2fc12B75152cD45Dd164",
      AmysStakingCo: "",
      PriceGetter: "0x8b2d2279F722BbB38A32b5ddd050378ffdF28Ee4",
      V2VaultHealer: "0xD4d696ad5A7779F4D3A0Fc1361adf46eC51C632d",
    },
    routers: {
      SushiSwap: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
      ApeSwap: "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607",
      JetSwap: "0x5C6EC38fb0e2609672BDf628B1fD605A523E5923",
      QuickSwap: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
      PolyCat: "0x94930a328162957ff1dd48900af67b5439336cbd",
      DinoSwap: "0x6AC823102CB347e1f5925C634B80a98A3aee7E03",
      Dfyn: "0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429",
      GreenHouse: "0x324Af1555Ea2b98114eCb852ed67c2B5821b455b",
    },
    tokens: {
      CRYSTL: "0x76bf0c28e604cc3fe9967c83b3c3f31c213cfe64",
      WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      WMATIC_DFYN: "0x4c28f48448720e9000907bc2611f73022fdce1fa",
      WETH: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
      DINO: "0xAa9654BECca45B5BDFA5ac646c939C62b527D394",
      USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      DAI: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      PWINGS: "0x845E76A8691423fbc4ECb8Dd77556Cb61c09eE25",
      WBTC: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
      HAIR: "0x100A947f51fA3F1dcdF97f3aE507A72603cAE63C",
      BANANA: "0x5d47baba0d66083c52009271faf3f50dcc01023c",
      SING: "0xcb898b0efb084df14dd8e018da37b4d0f06ab26d",
      SX: "0x840195888db4d6a99ed9f73fcd3b225bb3cb1a79",
      KAVIAN: "0xc4df0e37e4ad3e5c6d1df12d3ca7feb9d2b67104",
      GPUL: "0x40ed0565ecfb14ebcdfe972624ff2364933a8ce3",
      GBNT: "0x8c9aaca6e712e2193acccbac1a024e09fb226e51",
      TAKO: "0x6D2a71f4edF10ab1E821B9B373363e1E24E5DF6b",
      INKU: "0x1Dd9e9e142f3f84d90aF1a9F2cb617C7e08420a4",
      ROLL: "0xc68e83a305b0fad69e264a1769a0a070f190d2d6",
      QUICK: "0x831753DD7087CaC61aB5644b308642cc1c33Dc13",
      KOM: "0xC004e2318722EA2b15499D6375905d75Ee5390B8",
      AZUKI: "0x7CdC0421469398e0F3aA8890693d86c840Ac8931",
      MUST: "0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f",
      DOKI: "0x5C7F7Fe4766fE8f0fa9b41E2E4194d939488ff1C",
      DFYN: "0xC168E40227E4ebD8C1caE80F7a55a4F0e6D66C97",
      FRM: "0xd99baFe5031cC8B345cb2e8c80135991F12D7130",
      ROUTE: "0x16eccfdbb4ee1a85a33f3a9b21175cd7ae753db4",
      dQUICK: "0xf28164A485B0B2C90639E47b0f377b4a438a16B1",
      BNB: "0xa649325aa7c5093d12d6f98eb4378deae68ce23f",
      GREEN: "0x40db6d7812b8288eca452f912ca9f262b186f278",
      PDSHARE: "0x3068382885602fc0089aec774944b5ad6123ae60",
      QI: "0x580A84C73811E1839F75d86d75d88cCa0c241fF4",
      SUSHI: "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a",
      PolyDoge: "0x8A953CfE442c5E8855cc6c61b1293FA648BAE472"
    },
    farms: {
      BarberShop: "0xC6Ae34172bB4fC40c49C3f53badEbcE3Bb8E6430",
      DinoSwap: "0x1948abc5400aa1d72223882958da3bec643fb4e5",
      JetSwap: "0x4e22399070aD5aD7f7BEb7d3A7b543e8EcBf1d85",
      TakoDefi: "0xB19300246e19929a617C4260189f7B759597B8d8",
      SushiSwap: "0x0769fd68dFb93167989C6f7254cd0D766Fb2841F",
      PolyRoll: "0x3C58EA8D37f4fc6882F678f822E383Df39260937",
      ApeSwap: "0x54aff400858Dcac39797a81894D9920f16972D1D",
      GreenHouse: "0xbD40a260Ddd78287ddA4C4ede5880505a9fEdF9a",
      PDDAORewards: "0x9682d175830643658798ac3367915e57bddb506a",
      QiDao: "0x574Fe4E8120C4Da1741b5Fd45584de7A5b521F0F",
    },
    factories: {
      ApeSwap: "0xCf083Be4164828f00cAE704EC15a36D711491284",
      QuickSwap: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
      SushiSwap: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
      DFYN: "0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B",
    },
  },
  CRONOS: {
    ENDPOINT: process.env.CRONOS_RPC,
    V3Vaults: {
      VaultHealer: "0xba6f3b9bf74fbfa59d55e52fa722e6a5737070d0",
      Strategies: {Strategy: "0x04153E4493bD15ABd530670F23a8Dc53D6eE3068"},
      BoostPool: "0x154fbf66d949a7000db0736c46c7a459c6f7b9cf",
      MagnetiteProxy: "0x5e740b6cb14b8df73a44e3b6c059e5b3310f6af9",
      AmysStakingCo: "0x35c7a156Cb47d1B117382CE6191795373eF6c085", //needs to be updated
      PriceGetter: "0xb9B5792791DC8A76123A4545253D73F4624cc0B3",
      V2VaultHealer: "0x4dF0dDc29cE92106eb8C8c17e21083D4e3862533",
    },
    routers: {
      CRONASWAP: "0xcd7d16fB918511BF7269eC4f48d61D79Fb26f918",
      VVS: "0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae",
      MMF: "0x145677FC4d9b8F19B5D56d1820c48e0443049a30",
      Annex: "0x77bEFDE82ebA4BDC4D3E4a853BF3EA4FFB49Dd58",
    },
    tokens: {
      CRONA: "0xadbd1231fb360047525BEdF962581F3eee7b49fe",
      VVS: "0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03",
      WCRO: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
      WBTC: "0x062E66477Faf219F25D27dCED647BF57C3107d52",
      WETH: "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a",
      USDC: "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
      CRYSTL: "0xCbDE0E17d14F49e10a10302a32d17AE88a7Ecb8B",
      DEER: "0x6D6D6ba0c7e7DBaFffeC82b1ddF92e271650a63A",
      DINOP: "0x7091002B330D8054cb8584e5057451Ba983b975E",
      sDINOP: "0xC21718b8a93529d33E7b5dCdFF439402c47428aC",
      ANN: "0x98936Bde1CF1BFf1e7a8012Cee5e2583851f2067",
      ARGO: "0x47A9D630dc5b28F75d3AF3be3AAa982512Cd89Aa",
      bCRO: "0xeBAceB7F193955b946cC5dd8f8724a80671a1F2F",
      xARGO: "0xb966B5D6A0fCd5b373B180Bbe072BBFbbEe10552"
    },
    farms: {
      CronaSwap: "0x7b1982b896cf2034a0674acf67dc7924444637e4",
      VVS: "0xDccd6455AE04b03d785F12196B492b18129564bc",
      Annex: "0xEF6d860B22cEFe19Ae124b74eb80F0c0eb8201F4",
    },
    factories: {
      VVS: "0x3b44b2a187a7b3824131f8db5a74194d0a42fc15",
      MMF: "0xd590cC180601AEcD6eeADD9B7f2B7611519544f4",
      Crodex: "0xe9c29cB475C0ADe80bE0319B74AD112F1e80058F",
      CronaSwap: "0x73A48f8f521EB31c55c0e1274dB0898dE599Cb11",
      Annex: "0x1cc79ECb3a6f9B6d6FaF7298ec6D8667E814d592",
    },
  },
  BSC: {
    ENDPOINT: process.env.BSC_RPC,
    V3Vaults: {
      VaultHealer: "0x662018D4fbD804631920d45610E0Ee928Ca75d7c",
      Strategies: {Strategy : "0x20058692742dE4CdeF5043c80254dE526160b16D"},
      BoostPool: "0xe3a76Ab419D7466724243FE318dD28F0f5F710e9",
      MagnetiteProxy: "0xcde81e620245a22afeb694db93b681798ece0d4d",
      AmysStakingCo: "0xe93d7bDDE105061e9A6dA2d7AaaB2162f7c12107",
      PriceGetter: "0x6993fFaB6FD7c483f33A5E3EFDFEA676425C8F31",
    },
    routers: {
      PancakeSwap: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
      ApeSwap: "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
      BabySwap: "0x8317c460C22A9958c27b4B6403b98d2Ef4E2ad32",
      BiSwap: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
      SushiSwap: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
      Annex: "0xBa67BA73774dA585664661d22775dB9761418dC5",
      MDX: "0x0384E9ad329396C3A6A401243Ca71633B2bC4333"
    },
    tokens: {
      CAKE: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
      BANANA: "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
      BABY: "0x53e562b9b7e5e94b81f10e96ee70ad06df3d2657",
      BSW: "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1",
      WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      ANN: "0x98936Bde1CF1BFf1e7a8012Cee5e2583851f2067",
      MDX: "0x9C65AB58d8d978DB963e63f2bfB7121627e3a739"
    },
    farms: {
      PancakeSwap: "0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652",
      ApeSwap: "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9",
      BabySwap: "0xdfAa0e08e357dB0153927C7EaBB492d1F60aC730",
      BiSwap: "0xDbc1A13490deeF9c3C12b44FE77b503c1B061739",
      Annex: "0x9c821500eaba9f9737fdaadf7984dff03edc74d1",
      MDX: "0xc48fe252aa631017df253578b1405ea399728a50"
    },
    factories: {
      PancakeSwap: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
      ApeSwap: "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6",
      BabySwap: "0x86407bEa2078ea5f5EB5A52B2caA963bC1F889Da",
      SushiSwap: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
      Annex: "0x6100af6980d35FDb119BECE4969fF6b68DA6e4ea",
    },
  },
};