import { web3FromSource } from "@polkadot/extension-dapp";
import { useState } from "react";
import { useAsyncEffect } from "use-async-effect";

export const useTransaction = (dependencies) => {
    const { api, accounts, ready, modules, toast } = dependencies;

    const [account, setAccount] = useState();
    const [injector, setInjector] = useState();

    useAsyncEffect(async () => {
        try {
            if (accounts && accounts.length > 0) {
                const account = accounts[0];
                const injector = await web3FromSource(account.meta.source);
                setAccount(account);
                setInjector(injector);
                console.log("in hooks", account)
            }
        } catch (error) {
            console.log(error);
        }
    }, [accounts, ready]);

    function newTransaction(pallet, module, args) {
        // if (ready) {
        return new Promise(async resolve => {
            if (ready && accounts && accounts.length > 0) {
                console.log(ready, pallet, module, args);
                const transferExtrinsic = api.tx[pallet][module](...args);
                console.log("start");
                const unsub = await transferExtrinsic.signAndSend(
                    account.address,
                    { signer: injector.signer },
                    (result, t) => {
                        let blockHash;
                        if (result.status.isFinalized || result.status.isInBlock) {
                            if (result.status.isInBlock) {
                                blockHash = result.status.asInBlock.toString();
                            } else if (result.status.isFinalized) {
                                blockHash = result.status.asFinalized.toString();
                                unsub();
                            }
                            result.events
                                .filter(({ event: { section } }) => section === "system")
                                .forEach(({ event: { data, method } }) => {
                                    if (method === "ExtrinsicFailed") {
                                        const [dispatchError] = data;
                                        if (dispatchError.isModule) {
                                            try {
                                                const mod = dispatchError.asModule;
                                                const _mod = modules[mod.index.toNumber()];
                                                const modName = _mod.name;
                                                // why it can't get errors in metadata?
                                                const errorName = _mod.errors[mod.error.toNumber()];
                                                const error = `${modName}-${errorName}`;

                                                toast({
                                                    title: error,
                                                    description: `error in ${blockHash}`,
                                                    status: "error",
                                                    duration: 9000,
                                                    isClosable: true,
                                                });
                                                resolve({ hash: blockHash, success: false })
                                            } catch (error) {
                                                toast({
                                                    title: error.name,
                                                    description: `error in ${blockHash}`,
                                                    status: "error",
                                                    duration: 9000,
                                                    isClosable: true,
                                                });
                                                resolve({ hash: blockHash, success: false })

                                            }
                                        }
                                    } else if (method === "ExtrinsicSuccess") {
                                        console.log("success!!");
                                        toast({
                                            description: `success in ${blockHash}`,
                                            status: "success",
                                            duration: 9000,
                                            isClosable: true,
                                        });
                                        resolve({ hash: blockHash, success: true })
                                    }
                                });
                        } else if (result.isError) {
                            toast({
                                description: `something is wrong`,
                                status: "error",
                                duration: 9000,
                                isClosable: true,
                            });
                            resolve({ hash: '', success: false })
                        }
                    }
                );
            } else {
                toast({
                    description: `api not ready`,
                    status: "error",
                    duration: 9000,
                    isClosable: true,
                });
                resolve({ hash: '', success: false })
            }
        })
    }

    return newTransaction;
};
