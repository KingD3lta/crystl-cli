export const calcDust = async (PriceGetter: any, wantAddr: any, earnedAddrArray: any[], Token: any) => {
  let EarnedDustArray: number[] = new Array()
    console.log("Calculating Want Dust...");
    console.log("Earned Array:",earnedAddrArray)
    Token = await Token.attach(wantAddr);
    let decimals = await Token.decimals();
    let val = await PriceGetter.getLPPrice(wantAddr, decimals);
    let equalsTenCents = (1e17 / val) * 1e18;
    const WantDust: number = Math.floor(Math.log2(equalsTenCents));
    console.log("Want Dust Log Value:", WantDust);
  
    // // determine dust for Earned array
    console.log("Calculating Earned Dust... ");
    for (let i = 0; i < earnedAddrArray.length; i++) {
      if(earnedAddrArray[i]!= undefined){
      Token = await Token.attach(earnedAddrArray[i]);
      let decimals = await Token.decimals();
      let val = await PriceGetter.getLPPrice(earnedAddrArray[i], decimals);
      let equalsOneDollar = (1e18 / val) * 1e18;
      EarnedDustArray.push(Math.floor(Math.log2(equalsOneDollar)));
    }
  }
    return [WantDust, EarnedDustArray] as const;
  }