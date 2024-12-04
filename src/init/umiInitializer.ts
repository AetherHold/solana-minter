import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { Keypair } from "@solana/web3.js";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";

export function initializeUmi(rpcUrl: string, walletKeypair: Keypair) {
    return createUmi(rpcUrl)
        .use(walletAdapterIdentity(walletKeypair))
        .use(mplTokenMetadata());
}
