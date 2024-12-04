import { SolanaEnv } from "./init";
import { internalFunctions, InternalFunctions } from "./internal/index";
import { programs, ProgramFunctions } from "./programs/index";
import * as fs from "fs";
import * as path from "path";

export function missionManager(config: {
    "solana-net": string;
    toDo: "internal" | "program";
    program: {
        programId: string;
        function: string;
    };
    args: string;
}, env: SolanaEnv) {
    console.log(`Executing task based on config: ${JSON.stringify(config, null, 2)}`);

    if (config.toDo === "internal") {
        if (!Object.values(InternalFunctions).includes(config.args as InternalFunctions)) {
            throw new Error(`Internal function "${config.args}" not found in InternalFunctions enum.`);
        }

        const internalFunction = internalFunctions[config.args as InternalFunctions];
        internalFunction(env);
    } else if (config.toDo === "program") {
        const argsFilePath = path.resolve(__dirname, `../data/args/${config.args}.json`);
        if (!fs.existsSync(argsFilePath)) {
            throw new Error(`Args file "${config.args}.json" not found in src/data/args.`);
        }

        const args = JSON.parse(fs.readFileSync(argsFilePath, "utf-8"));

        if (!Object.values(ProgramFunctions).includes(config.program.function as ProgramFunctions)) {
            throw new Error(`Program function "${config.program.function}" not found.`);
        }

        const programFunction = programs[config.program.function as ProgramFunctions];
        programFunction(env, config.program.programId, args);
    } else {
        throw new Error(`Invalid toDo type: "${config.toDo}".`);
    }
}
