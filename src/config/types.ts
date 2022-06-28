export type ValidTacticsCode = "EOL" | "bytesZero" | "amount" | "addrThis" | "pid";

export type ValidTactics = 
{
    vstReturn,
    vst,
    deposit,
    withdraw,
    harvest,
    sos
}

export type EncodedSelectors = {
    vst: string[],
    deposit: string[],
    withdraw: string[],
    harvest: string[],
    sos: string[]
 }

export type EncodedArgs = { 
    vst: string[],
    dep: string[],
    wd: string[],
    harv: string[],
    sos: string[]
}

export type ChainSpecificData = {
    V3: object,
    network:string,
    tokens: object,
    routers: object,
    farms: object,
    factories: object
}

export type ValidConfigData = {
    want: string,
    earned: string[],
    farm: string,
    pid: string | number ,
    router: string,
  }