import {
    Keypair,
    SystemProgram,
    Transaction,
    Connection,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export interface CreateMintAccountParams {
    connection: Connection;
    payer: Keypair;
    mintKeypair: Keypair;
    decimals: number;
    space?: number;
}

export async function createMintAccountWithATAAndSend(
    params: CreateMintAccountParams
): Promise<string> {
    const { connection, payer, mintKeypair, decimals } = params;
    const space = params.space ?? 82;

    const lamports = await connection.getMinimumBalanceForRentExemption(space);
    const associatedAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        payer.publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction()
        .add(
            SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                lamports,
                space,
                programId: TOKEN_PROGRAM_ID,
            }),
            createInitializeMintInstruction(
                mintKeypair.publicKey, // Mint
                decimals,
                payer.publicKey, // Mint Authority
                payer.publicKey // Freeze Authority
            ),
            createAssociatedTokenAccountInstruction(
                payer.publicKey, // Payer
                associatedAccount, // ATA address
                payer.publicKey, // Owner
                mintKeypair.publicKey, // Mint
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );

    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // 签名交易
    transaction.sign(payer, mintKeypair);

    // 发送交易
    const signature = await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair]);
    console.log("Transaction signature:", signature);

    return signature;
}
