import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import {
    Umi,
    publicKey as toMetaplexPublicKey,
    transactionBuilder,
} from '@metaplex-foundation/umi';
import {
    setAndVerifyCollection,
} from '@metaplex-foundation/mpl-token-metadata';
import { PublicKey } from '@solana/web3.js';
import { publicKey as publicKeySerializer, string } from '@metaplex-foundation/umi/serializers';

/**
 * Set up and validate the NFT Collection
 * @param umi - The umi instance of Metaplex.
 * @param mintNftAddress - the NFT Mint address to validate.
 * @param collectionMintAddress - The Mint address of the Collection.
 * @param connection - Solana Connection
 * @returns Transaction Signature
 */
export async function verifyNft(
    umi: Umi,
    mintNftAddress: PublicKey,
    collectionMintAddress: PublicKey,
    // connection: Connection
): Promise<string> {
    console.log("Starting verifyNft...");

    const mplMetadataProgramId = toMetaplexPublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

    const mplNftMint = toMetaplexPublicKey(mintNftAddress);
    const mintMetadataPda = umi.eddsa.findPda(mplMetadataProgramId, [
        string({ size: "variable" }).serialize("metadata"),
        publicKeySerializer().serialize(mplMetadataProgramId),
        publicKeySerializer().serialize(mplNftMint),
    ]);
    const mplMintMetadataAccount = toMetaplexPublicKey(mintMetadataPda);

    const mplCollectionMint = toMetaplexPublicKey(collectionMintAddress);
    const collectionMetadataPda = umi.eddsa.findPda(mplMetadataProgramId, [
        string({ size: "variable" }).serialize("metadata"),
        publicKeySerializer().serialize(mplMetadataProgramId),
        publicKeySerializer().serialize(mplCollectionMint),
    ]);
    const mplCollectionMetadataPda = toMetaplexPublicKey(collectionMetadataPda);

    const collectionMasterEditionPda = umi.eddsa.findPda(mplMetadataProgramId, [
        string({ size: "variable" }).serialize("metadata"),
        publicKeySerializer().serialize(mplMetadataProgramId),
        publicKeySerializer().serialize(mplCollectionMint),
        string({ size: "variable" }).serialize("edition"),
    ]);
    const collectionMasterEditionAccount = toMetaplexPublicKey(collectionMasterEditionPda);

    const setAndVerifyCollectionInstruction = {
        metadata: mplMintMetadataAccount,
        collectionAuthority: umi.payer,
        payer: umi.payer,
        collectionMint: mplCollectionMint,
        collection: mplCollectionMetadataPda,
        collectionMasterEditionAccount: collectionMasterEditionAccount,
    };

    const setAndVerifyMintNftTxContent = setAndVerifyCollection(umi, {
        ...setAndVerifyCollectionInstruction,
    });

    const builder = transactionBuilder().add(setAndVerifyMintNftTxContent);

    const addedBlockHashBuilder = await builder.setLatestBlockhash(umi);

    const builtTransaction = await addedBlockHashBuilder
        .setFeePayer(umi.payer)
        .buildAndSign(umi);

    const sentTxSignature = await umi.rpc.sendTransaction(builtTransaction);

    const signatureBase58 = bs58.encode(Buffer.from(sentTxSignature));
    console.log(
        `Collection verified: https://explorer.solana.com/tx/${signatureBase58}?cluster=devnet`
    );

    return signatureBase58;
}
