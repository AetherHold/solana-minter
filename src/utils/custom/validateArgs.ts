import * as fs from "fs";
import * as path from "path";

export function validateArgs(args: any, idlArgs: { name: string; type: string }[]) {
    for (const { name, type } of idlArgs) {
        if (!args[name] || typeof args[name] !== type) {
            throw new Error(`Invalid or missing "${name}" in args.`);
        }
    }
}

export interface ArgObject {
    transfer: string;
    args: {
        name: string;
        symbol: string;
        uri: string;
    };
}

export function saveResultsAndRemainingArgs(task: string, results: any, remainingArgs: any) {
    const resultsDir = path.resolve(__dirname, "../../data/results");
    const argsDir = path.resolve(__dirname, "../../data/args");

    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    if (!fs.existsSync(argsDir)) {
        fs.mkdirSync(argsDir, { recursive: true });
    }
    const now = new Date();
    const timestamp = `${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}`;

    const resultFilePath = path.join(resultsDir, `${task}_${timestamp}.json`);
    const argsFilePath = path.join(argsDir, `${task}.json`);

    fs.writeFileSync(resultFilePath, JSON.stringify(results, null, 2));
    console.log(`Results saved to "${resultFilePath}"`);

    fs.writeFileSync(argsFilePath, JSON.stringify(remainingArgs, null, 2));
    console.log(`Remaining args saved to "${argsFilePath}"`);
}

export function validateMintNftArgs(args: { name: string; symbol: string; uri: string }): void {
    const idlArgs = [
        { name: "name", type: "string" },
        { name: "symbol", type: "string" },
        { name: "uri", type: "string" },
    ];

    for (const { name, type } of idlArgs) {
        if (!args[name as keyof typeof args] || typeof args[name as keyof typeof args] !== type) {
            throw new Error(`Invalid or missing "${name}" in args.`);
        }
    }
}
