export const create = async (isMaximiser: boolean, VaultHealer: any, targetVid: string, Config: any, stratAddr: any) => {
    if (isMaximiser) {
      let createMaxi = await VaultHealer.createMaximizer(targetVid, Config);
      console.log("Maximiser Created At Txn Hash:", createMaxi.hash);
      createMaxi = await createMaxi.wait(1);
      console.log(
        "Vid For newly created Maximiser [HEX]:",
        createMaxi.events[1].args[0].toHexString()
      );
      console.log(
        "Vid For newly created Maximiser [DECIMAL]:",
        createMaxi.events[1].args[0].toString()
      );
    } else {
      let createVault = await VaultHealer.createVault(stratAddr, Config);
      console.log("Vault Created At Txn Hash:", createVault.hash);
      createVault = await createVault.wait(1);
      console.log(
        "Vid For newly created Vault [HEX]:",
        createVault.events[1].args[0].toHexString()
      );
      console.log(
        "Vid For newly created Vault [DECIMAL]:",
        createVault.events[1].args[0].toString()
      );
    }
  }