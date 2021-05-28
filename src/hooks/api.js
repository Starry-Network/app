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

    const types = {
        "TokenType": { "_enum": ["NonFungible", "Fungible"] },
        "CollectionInfo": {
            "owner": "AccountId",
            "uri": "Vec<u8>",
            "total_supply": "u128",
            "token_type": "Option<TokenType>"
        },
        "TokenInfo": {
            "end_idx": "u128",
            "owner": "AccountId",
            "uri": "Vec<u8>"
        },
        "DAOInfo": {
            "account_id": "AccountId",
            "escrow_id": "AccountId",
            "details": "Vec<u8>",
            "period_duration": "u128",
            "voting_period": "u128",
            "grace_period": "u128",
            "metadata": "Vec<u8>",
            "total_shares": "u128",
            "summoning_time": "BlockNumber",
            "dilution_bound": "u128",
            "proposal_deposit": "Balance",
            "processing_reward": "Balance"
        },
        "Member": {
            "shares": "u128",
            "highest_index_yes_vote": "u128"
        },
        "NonFungibleOrderInfo": {
            "collection_id": "Hash",
            "start_idx": "u128",
            "seller": "AccountId",
            "price": "Balance",
            "amount": "u128"
        },
        "SemiFungiblePoolInfo": {
            "seller": "AccountId",
            "supply": "u128",
            "m": "u128",
            "sold": "u128",
            "reverse_ratio": "u128",
            "pool_balance": "Balance",
            "end_time": "BlockNumber"
        }
    }


    useAsyncEffect(async () => {
        const autoConnectMs = 2000;
        const endpoint = process.env.REACT_APP_CHAIN_ENDPOINT;

        const provider = new WsProvider(endpoint, autoConnectMs);
        const newApi = await ApiPromise.create({ provider, types });
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
