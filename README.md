# README

A simple large number of NFTs castings are available for your application to use.

## Quick Start

.env at ./secret/.env , ENV content:

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

Scripts would run til no data or wallet no money.

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
    "args": "your_task" // your task file name at ./src/data/args
}
```

Make sure you already have node.js 18.18.2 or above.

```bash
npm install
```

Check test

```bash
npx jest
```

Run

```bash
npx ts-node ./main.ts
```

### Other help tester

Generate arg for test

```bash
npx ts-node ./scripts/generateArgFile.ts
```
