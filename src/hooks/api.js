import { createContext, useState, useContext } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";
import { useAsyncEffect } from 'use-async-effect'
import BN from 'bn.js';

const ApiContext = createContext({});

// console.log(process.env.REACT_APP_CHAIN_ENDPOINT)

const ApiProvider = ({ children }) => {
    const DEFAULT_TIME = new BN(6000);

    const [api, setApi] = useState();
    const [modules, setModules] = useState();
    const [accounts, setAccounts] = useState();
    const [isApiInitialized, setIsApiInitialized] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [blockTime, setBlockTime] = useState(DEFAULT_TIME.toNumber())

    useAsyncEffect(async () => {
        const autoConnectMs = 2000;
        const endpoint = process.env.REACT_APP_CHAIN_ENDPOINT;

        const provider = new WsProvider(endpoint, autoConnectMs);
        const newApi = await ApiPromise.create({ provider });
        try {
            // await newApi.isReadyOrError();
            await newApi.isReadyOrError;
            console.log("api is ready")
            setApi(newApi);
            const metadata = await newApi.rpc.state.getMetadata();
            const modules = metadata.asLatest.modules;
            setModules(modules);
            const blockTime = (
                api.consts.babe?.expectedBlockTime ||
                api.consts.difficulty?.targetBlockTime ||
                api.consts.timestamp?.minimumPeriod.muln(2) ||
                DEFAULT_TIME
            ).toNumber();
            setBlockTime(blockTime);
        } catch (error) {
            console.log(error);
            setApiError(error.message);
        }

        try {
            const extensions = web3Enable("polkadot-js/apps");

            const accounts = await web3Accounts();

            if (!extensions.length && !accounts.length) {
                setAccounts(null);
            } else {
                console.log(accounts)
                setAccounts(accounts);
            }
            setApiError(null);
        } catch (error) {
            setApiError(error.message);
        }
        setIsApiInitialized(true);
    }, [])


    console.log("api", api)
    return (
        <ApiContext.Provider
            value={{ api, accounts, modules, ready: !!api, setAccounts, blockTime, isApiInitialized, apiError }}
        >
            {children}
        </ApiContext.Provider>
    );
};

const useApi = () => useContext(ApiContext);

export { ApiContext, ApiProvider, useApi };
