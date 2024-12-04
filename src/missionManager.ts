import { SolanaEnv } from "./init";
import * as programs from "./programs/index";

export function missionManager(task: string, env: SolanaEnv) {
    console.log(`Executing mission: ${task}`);

    const internalFunctions: Record<string, (env: SolanaEnv) => void> = {
        exampleInternalFunction: (env) => {
            console.log("Internal function executed with:", env.connection.rpcEndpoint);
        },
    };

    if (internalFunctions[task]) {
        // 執行內部功能
        internalFunctions[task](env);
    } else if (programs[task]) {
        // 執行 Program 功能
        programs[task](env);
    } else {
        throw new Error(`Task "${task}" not found.`);
    }
}
