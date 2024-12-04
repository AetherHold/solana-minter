import { Connection, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

export function initializeAnchorProvider(rpcUrl: string, walletKeypair: Keypair) {
    // 使用傳入的 Keypair
    const connection = new Connection(rpcUrl, "processed");

    const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(walletKeypair), {
        preflightCommitment: "processed",
    });

    anchor.setProvider(provider);

    return provider;
}
export async function initializeProgram<T>(provider: anchor.AnchorProvider, idl: T, programId: string) {
    const program = new anchor.Program(idl as anchor.Idl, programId, provider);
    return program;
}
