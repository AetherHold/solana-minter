# README

A simple large number of NFTs castings are available for your application to use.

## Quick Start

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

Place your task at ./src/data/args/your_task.json

```jsonc
{
    "object0": {
        "transfer": "",
        "args": {
            "name": "Test NFT_#1",
            "symbol": "TEST",
            "uri": "https://example.com/metadata.json"
        }
    },
    "object1": {
        "transfer": "",
        "args": {
            "name": "Test NFT_#2",
            "symbol": "TEST",
            "uri": "https://example.com/metadata.json"
        }
    }
}
```

Setup Config at ./config.json

```jsonc
{
    "solana-net": "devnet", // "devnet" || "mainnet"
    "toDo": {
        "programId": "4u3DGBGpxb8963q2sJEasrKP73tQ2rbEgoUsVEqH4bY5", // your program id
        "function": "mintNft" // target function
    },
    "sources": "your_task"
}
```

Check test

```bash
npx jest
```

Run

```bash
npx ts-node ./main.ts
```

## Genarate

Generate arg

```bash
npx ts-node ./scripts/generateArgFile.ts
```
