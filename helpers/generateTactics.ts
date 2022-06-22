export const generateConfig = async (
  Strategy,
  farmPid,
  data,
  wantAddr,
  earnedAddrArray,
  wantDust,
  earnedDustArray,
  platform
) => {
  var [tacticsA, tacticsB] = await Strategy.generateTactics(
    data.farms[platform],
    farmPid, //farmPid 
    0, //position of return value in vaultSharesTotal returnData array
    "0x93f1a40b23000000", //vaultSharesTotal - includes selector and encoded call format
    "0x41441d3b40000000", //deposit - includes selector and encoded call format
    "0x1058d28140000000", //withdraw - includes selector and encoded call format
    "0x1058d281f0000000", //harvest - includes selector and encoded call format
    "0x5312ea8e20000000" //emergency withdraw - includes selector and encoded call format
  );
  let deploymentConfig = await Strategy.generateConfig(
    tacticsA,
    tacticsB,
    wantAddr,
    wantDust,
    data.routers[platform],
    data.V3Vaults.MagnetiteAddr,
    240,
    false,
    earnedAddrArray,
    earnedDustArray
  );
  //console.log("Config Generated:", deploymentConfig);
  return deploymentConfig
};
