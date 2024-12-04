import { Keypair } from "@solana/web3.js";
import { initializeKeypair, SolanaEnv } from "../init";
import { createMintAccountWithATAAndSend } from "../utils/solana/createMintAccountWithATA";

export enum InternalFunctions {
    CreateMintAccountWithATA = "createMintAccountWithATA",
    AnotherInternalFunction = "anotherInternalFunction", // 可擴展
}

export const internalFunctions: Record<InternalFunctions, (env: SolanaEnv) => void> = {
    [InternalFunctions.CreateMintAccountWithATA]: async (env) => {
        console.log("Executing createMintAccountWithATA...");

        const mintKeypair = Keypair.generate();
        const scriptsKeypair = initializeKeypair();
        const params = {
            connection: env.connection,
            payer: scriptsKeypair,
            mintKeypair,
            decimals: 9,
            space: 82,
        };

        try {
            const signature = await createMintAccountWithATAAndSend(params);
            console.log("Mint account created successfully with transaction signature:", signature);
        } catch (error) {
            console.error("Failed to create mint account:", error);
        }
    },
    [InternalFunctions.AnotherInternalFunction]: (env) => {
        console.log("Executing another internal function...");
    },
};
