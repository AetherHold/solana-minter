import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { initializeKeypair, SolanaEnv } from "../init";
import { saveResultsAndRemainingArgs, validateArgs } from "../utils/custom/validateArgs";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { createMintAccountWithATAAndSend } from "../utils/solana/createMintAccountWithATA";
import { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";
import {
    publicKey as toMetaplexPublicKey,
} from "@metaplex-foundation/umi";
import { publicKey as publicKeySerializer, string } from '@metaplex-foundation/umi/serializers';

export enum ProgramFunctions {
    MintNft = "mintNft",
    AnotherProgramFunction = "anotherProgramFunction",
}

interface ArgObject {
    transfer: string; // receiver
    args: {
        name: string;
        symbol: string;
        uri: string;
    };
}
type ArgsType = Record<string, ArgObject>;


function validateMintNftArgs(args: { name: string; symbol: string; uri: string }): void {
    const idlArgs: { name: keyof typeof args; type: string }[] = [
        { name: "name", type: "string" },
        { name: "symbol", type: "string" },
        { name: "uri", type: "string" },
    ];

    for (const { name, type } of idlArgs) {
        if (!args[name] || typeof args[name] !== type) {
            throw new Error(`Invalid or missing "${name}" in args.`);
        }
    }
}

export function loadProgram(idlDir: string, programId: string, connection: Connection, wallet: any): Program {
    const idlPath = path.resolve(idlDir, `${programId}.json`);

    if (!fs.existsSync(idlPath)) {
        throw new Error(`IDL file not found for programId: ${programId}. Expected path: ${idlPath}`);
    }

    const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

    return new Program(idl, programId, { connection });
}

export const programs: Record<
    ProgramFunctions,
    (env: SolanaEnv, programId: string, args: ArgsType) => Promise<void>
> = {
    [ProgramFunctions.MintNft]: async (env, programId, args) => {
        console.log("Executing MintNft...");
        const idlDir = path.resolve(__dirname, "../data/idls");
        const program = loadProgram(idlDir, programId, env.connection, env.anchorProvider.wallet);
        const results: { [key: string]: { nftPublicKey: string; transactionLink: string } } = {};
        const remainingArgs: { [key: string]: any } = { ...args };
        const configPath = path.resolve(__dirname, "../../config.json");
        if (!fs.existsSync(configPath)) {
            throw new Error("Configuration file not found: config.json");
        }

        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        const taskName = config.args;

        for (const [key, obj] of Object.entries(args)) {
            try {
                validateMintNftArgs(obj.args);

                const mint = Keypair.generate();
                const scriptsKeypair = initializeKeypair();
                // Mint NFT
                const newNftPublicKey = await createMintAccountWithATAAndSend({
                    connection: env.connection,
                    payer: scriptsKeypair,
                    mintKeypair: mint,
                    decimals: 0,
                });

                console.log("Mint Public Key:", newNftPublicKey);

                const associatedTokenAccount = await getAssociatedTokenAddress(
                    mint.publicKey,
                    env.anchorProvider.wallet.publicKey,
                    false,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                const timeoutMs = 10000;
                const retryIntervalMs = 1000;
                const start = Date.now();

                while (Date.now() - start < timeoutMs) {
                    const mintAccountInfo = await env.connection.getAccountInfo(mint.publicKey);
                    const associatedTokenAccountInfo = await env.connection.getAccountInfo(associatedTokenAccount);

                    if (mintAccountInfo && associatedTokenAccountInfo) {
                        console.log("Mint account and associated token account successfully initialized.");
                        break;
                    }

                    console.warn("Mint or associated token account is not initialized. Retrying...");
                    await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
                }

                // 最终确认 Mint 和 ATA 是否已经初始化
                const mintAccountInfo = await env.connection.getAccountInfo(mint.publicKey);
                const associatedTokenAccountInfo = await env.connection.getAccountInfo(associatedTokenAccount);

                if (!mintAccountInfo || !associatedTokenAccountInfo) {
                    throw new Error("Mint account or associated token account failed to initialize within timeout.");
                }

                const mplMetadataProgramId = toMetaplexPublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
                const mplUserMint = toMetaplexPublicKey(mint.publicKey);
                // 使用 `mplMetadataUmi.eddsa.findPda` 手动生成 Metadata PDA
                const metadataPda = env.umi.eddsa.findPda(mplMetadataProgramId, [
                    string({ size: 'variable' }).serialize('metadata'), // Seed 1: 字符串 'metadata'
                    publicKeySerializer().serialize(mplMetadataProgramId), // Seed 2: Metadata Program 的 PublicKey
                    publicKeySerializer().serialize(mplUserMint), // Seed 3: 当前 collectoin mint 的 PublicKey
                ]);

                const metadataAccount = toMetaplexPublicKey(metadataPda);

                const collectionSolanaPublicKey = new PublicKey("Gnt5AXWLAyYBaJiTwYgcbYQRA1GhJ8HW7ASyi9PRbk9A");
                const collectionMplublicKey = toMetaplexPublicKey(collectionSolanaPublicKey);
                const programTx = await program.methods
                    .mintNft(obj.args.name, obj.args.symbol, obj.args.uri)
                    .accounts({
                        signer: env.anchorProvider.publicKey,
                        mint: mint.publicKey,
                        associatedTokenAccount,
                        metadataAccount,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
                        systemProgram: anchor.web3.SystemProgram.programId,
                        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                        collectionMint: collectionMplublicKey,
                    })
                    .transaction();

                programTx.recentBlockhash = (await env.connection.getLatestBlockhash()).blockhash;
                programTx.feePayer = env.anchorProvider.wallet.publicKey;

                const signedTransaction = await env.anchorProvider.wallet.signTransaction(programTx);

                const txSignature = await env.connection.sendRawTransaction(signedTransaction.serialize());
                console.log(`Transaction Signature: ${txSignature}`);

                // const confirmedTx = await env.connection.confirmTransaction(txSignature, "confirmed");
                // if (confirmedTx.value.err) {
                //     throw new Error(`Transaction failed: ${JSON.stringify(confirmedTx.value.err)}`);
                // }
                try {
                    const latestBlockhash = await env.connection.getLatestBlockhash();

                    const confirmedTx = await env.connection.confirmTransaction(
                        {
                            signature: txSignature,
                            blockhash: latestBlockhash.blockhash,
                            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                        },
                        "confirmed" // Commitment level
                    );

                    if (confirmedTx.value.err) {
                        throw new Error(`Transaction failed: ${JSON.stringify(confirmedTx.value.err)}`);
                    }

                    console.log("Transaction successfully confirmed:", txSignature);
                } catch (error) {
                    console.error("Error confirming transaction:", error);
                }


                console.log(`Transaction successful: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);

                // if (obj.transfer) {
                //     await transferNft(env, mintKeypair.publicKey, obj.transfer);
                //     console.log(`Transfer successful for ${key}`);
                // }
                results[key] = {
                    nftPublicKey: newNftPublicKey,
                    transactionLink: `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
                };

                delete remainingArgs[key];
                saveResultsAndRemainingArgs(taskName, results, remainingArgs);
            } catch (error) {
                console.error(`Error processing ${key}:`, error);
                break;
            }
        }
        saveResultsAndRemainingArgs(taskName, results, remainingArgs);

    },
    [ProgramFunctions.AnotherProgramFunction]: function (env: SolanaEnv, programId: string, args: ArgsType): Promise<void> {
        throw new Error("Function not implemented.");
    }
};
