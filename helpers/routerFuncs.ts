export const getPairFor = async (tokenAddrs, Factory) => {
  const wantAddr = await Factory.getPair(tokenAddrs[0], tokenAddrs[1]);
  return wantAddr;
};