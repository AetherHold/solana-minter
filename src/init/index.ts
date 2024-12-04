import * as fs from "fs";
import dotenv from "dotenv";
import { Connection, Keypair } from "@solana/web3.js";
import { initializeAnchorProvider } from "./anchorInitializer";
import { initializeUmi } from "./umiInitializer";
import * as anchor from "@coral-xyz/anchor";
import * as path from "path";
import { createUmi } from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

const configPath = path.resolve(__dirname, "../../config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
dotenv.config({ path: path.resolve(__dirname, "../../secret/.env") });

function getRpcUrl(): string {
    if (config["solana-net"] === "mainnet") {
        if (!process.env.MAINNET_RPC_URL) {
            throw new Error("MAINNET_RPC_URL is required for mainnet but is not defined in .env file");
        }
        return process.env.MAINNET_RPC_URL;
    } else if (config["solana-net"] === "devnet") {
        return process.env.DEVNET_RPC_URL || "https://api.devnet.solana.com";
    }
    throw new Error("Invalid solana-net specified in config.json");
}

export interface SolanaEnv {
    connection: Connection;
    anchorProvider: anchor.AnchorProvider;
    umi: ReturnType<typeof createUmi>;
}

export function initializeKeypair(): Keypair {
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error("PRIVATE_KEY is not defined in .env file");
    }

    try {
        const decodedKey = bs58.decode(privateKey);

        if (decodedKey.length !== 64) {
            throw new Error("Invalid private key: decoded key is not 64 bytes");
        }

        return Keypair.fromSecretKey(Buffer.from(decodedKey));
    } catch (error) {
        throw new Error(`Invalid PRIVATE_KEY: ${error}`);
    }
}

export async function initialize() {
    const rpcUrl = getRpcUrl();
    const keypair = initializeKeypair();

    console.log(`Initializing Solana environment on ${config["solana-net"]}...`);

    const connection = new Connection(rpcUrl, "confirmed");

    const anchorProvider = initializeAnchorProvider(rpcUrl, keypair);

    const umi = initializeUmi(rpcUrl, keypair);

    return { connection, anchorProvider, umi };
}
