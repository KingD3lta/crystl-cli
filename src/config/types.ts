export type ValidTacticsCode = "EOL" | "bytesZero" | "amount" | "addrThis" | "pid";

export type ValidTactics = 
{
    vstReturn,
    vst,
    deposit,
    withdraw,
    harvest,
    SOS
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
    network:string,
    tokens: object,
    routers: object,
    farms: object,
    factories: object
}