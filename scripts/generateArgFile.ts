import fs from "fs";
import path from "path";

/**
 * Generate the specified number of objects into the args file
 * @param template Template object
 * @param count Number of objects to generate
 * @param outputFile The name of the output file.
 */
function generateArgsFile(template: Record<string, any>, count: number, outputFile: string): void {
    const generatedArgs: Record<string, any> = {};

    for (let i = 0; i < count; i++) {
        const key = `object${i}`;
        generatedArgs[key] = {
            ...template,
            args: {
                ...template.args,
                name: `${template.args.name}_#${i + 1}`,
            },
        };
    }

    const argsDir = path.resolve(__dirname, "../src/data/args");
    if (!fs.existsSync(argsDir)) {
        fs.mkdirSync(argsDir, { recursive: true });
    }

    const outputFilePath = path.join(argsDir, `${outputFile}.json`);
    fs.writeFileSync(outputFilePath, JSON.stringify(generatedArgs, null, 2));

    console.log(`Generated ${count} objects in "${outputFilePath}".`);
}

const template = {
    transfer: "",
    args: {
        name: "Test NFT",
        symbol: "TEST",
        uri: "https://example.com/metadata.json",
    },
};

const count = 10; // Generate 10 objects
const outputFile = "mintNftArgs";

generateArgsFile(template, count, outputFile);
