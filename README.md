# README

A simple large number of NFTs castings are available for your application to use.

ENV:

```makefile
# Base58 private key for development environment only.
# Do not store production environment private key here, suggest using secret key management tool.
PRIVATE_KEY=your_base58_private_key_here
# RPC URLs for Solana nodes
# Development Environment (Devnet)
DEVNET_RPC_URL=https://api.devnet.solana.com
# Solana Mainnet
MAINNET_RPC_URL=your-solana-mainnet-nodes
```

Please note! The wallet used for this script will be NFT authority.

## Config

At ./src/config.json

```jsonc
{
    "solana-net": "devnet", // "devnet" || "mainnet"
    "toDo": {
        "programId": "4u3DGBGpxb8963q2sJEasrKP73tQ2rbEgoUsVEqH4bY5", // your program id
        "function": "mintNft" // target function
    },
    "sources": "test1"
}
```
