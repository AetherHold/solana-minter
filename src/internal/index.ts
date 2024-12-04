import { SolanaEnv } from "../init";

export enum InternalFunctions {
    CreateMintAccountWithATA = "createMintAccountWithATA",
    AnotherInternalFunction = "anotherInternalFunction", // 可擴展
}

export const internalFunctions: Record<InternalFunctions, (env: SolanaEnv) => void> = {
    [InternalFunctions.CreateMintAccountWithATA]: (env) => {
        console.log("Executing createMintAccountWithATA...");
        console.log("Network:", env.connection.rpcEndpoint);
        console.log("Wallet Public Key:", env.anchorProvider.wallet.publicKey.toBase58());
    },
    [InternalFunctions.AnotherInternalFunction]: (env) => {
        console.log("Executing another internal function...");
    },
};
