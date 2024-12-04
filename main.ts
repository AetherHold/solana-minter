import { initialize } from "./src/init";
import { missionManager } from "./src/missionManager";
import * as fs from "fs";
import * as path from "path";

function loadConfig(): any {
    const configPath = path.resolve(__dirname, "./config.json");
    if (!fs.existsSync(configPath)) {
        throw new Error("Configuration file not found at ./config.json");
    }

    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

type MissionConfig = {
    "solana-net": string;
    toDo: "internal" | "program";
    program: {
        programId: string;
        function: string;
    };
    args: string;
};

function validateConfig(config: any): MissionConfig {
    if (
        typeof config["solana-net"] !== "string" ||
        (config.toDo !== "internal" && config.toDo !== "program") ||
        typeof config.program !== "object" ||
        typeof config.program.programId !== "string" ||
        typeof config.program.function !== "string" ||
        typeof config.args !== "string"
    ) {
        throw new Error("Invalid configuration format.");
    }
    return config as MissionConfig;
}

(async () => {
    try {
        const env = await initialize();

        console.log("Solana environment initialized!");
        console.log("Wallet Public Key:", env.anchorProvider.wallet.publicKey.toBase58());
        console.log("Connected to Network:", env.connection.rpcEndpoint);
        console.log("Umi Wallet Public Key:", env.umi.payer.publicKey.toString());

        const rawConfig = loadConfig();
        const config = validateConfig(rawConfig);

        missionManager(config, env);
    } catch (error) {
        console.error("Initialization failed:", error);
    }
})();