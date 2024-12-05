import { Keypair, PublicKey } from "@solana/web3.js";
import { initializeKeypair, SolanaEnv } from "../init";
import { createMintAccountWithATAAndSend } from "../utils/solana/createMintAccountWithATA";
import { verifyNft } from "../utils/metaplex/verifyNft";

export enum InternalFunctions {
    CreateMintAccountWithATA = "createMintAccountWithATA",
    VerifyNft = "verifyNft",
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
    [InternalFunctions.VerifyNft]: async (env) => {
        console.log("Executing verify nft...");

        const mintPublicKey = new PublicKey("3MSfSaLYPKHaqCXe4F2Pvdm4aVkXW6cPXYfPMwNF1g7m");
        const collectionPublicKey = new PublicKey("6SG255fLxcAHUgBYsi25pV6MuWMVGapWRzdQogVQpCEw");

        try {
            const signature = await verifyNft(env.umi, mintPublicKey, collectionPublicKey);
            console.log("Mint account created successfully with transaction signature:", signature);
        } catch (error) {
            console.error("Failed to create mint account:", error);
        }
    },
    [InternalFunctions.AnotherInternalFunction]: (env) => {
        console.log("Executing another internal function...");
    },
};
