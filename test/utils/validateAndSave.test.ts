import fs from "fs";
import path from "path";
import { saveResultsAndRemainingArgs, validateMintNftArgs } from "../../src/utils/custom/validateArgs";

jest.mock("fs");

describe("validateMintNftArgs", () => {
    it("should validate correct args without errors", () => {
        const validArgs = {
            name: "Test NFT",
            symbol: "TEST",
            uri: "https://example.com/metadata.json",
        };

        expect(() => validateMintNftArgs(validArgs)).not.toThrow();
    });

    it("should throw an error for missing or invalid args", () => {
        const invalidArgs = {
            name: "Test NFT",
            symbol: "TEST",
        }; // Missing "uri"

        expect(() => validateMintNftArgs(invalidArgs as any)).toThrowError(
            'Invalid or missing "uri" in args.'
        );
    });
});

describe("saveResultsAndRemainingArgs", () => {
    const resultsDir = path.resolve(__dirname, "../../src/data/results");
    const argsDir = path.resolve(__dirname, "../../src/data/args");

    beforeEach(() => {
        jest.resetAllMocks();
        (fs.existsSync as jest.Mock).mockImplementation((dirPath) => {
            // 模拟结果目录不存在
            if (dirPath === resultsDir) return false;
            // 模拟参数目录存在
            if (dirPath === argsDir) return true;
            return false;
        });
    });

    it("should save results and remaining args correctly", () => {
        const task = "mintNft";
        const results = { object1: "tx1", object2: "tx2" };
        const remainingArgs = {
            object3: {
                transfer: "RecipientAddress",
                args: {
                    name: "Another NFT",
                    symbol: "ANFT",
                    uri: "https://example.com/another-metadata.json",
                },
            },
        };

        const mockMkdirSync = jest.spyOn(fs, "mkdirSync").mockImplementation(() => { });
        const mockWriteFileSync = jest.spyOn(fs, "writeFileSync").mockImplementation(() => { });

        saveResultsAndRemainingArgs(task, results, remainingArgs);

        // 检查结果目录是否尝试创建
        expect(mockMkdirSync).toHaveBeenCalledWith(resultsDir, { recursive: true });

        // 检查参数目录是否尝试创建
        expect(mockMkdirSync).not.toHaveBeenCalledWith(argsDir, { recursive: true }); // 因为 existsSync 返回 true

        // 检查结果文件是否正确写入
        const resultFilePathRegex = new RegExp(`${resultsDir}/${task}_\\d{1,2}-\\d{1,2}_\\d{1,2}-\\d{1,2}\\.json`);
        expect(mockWriteFileSync).toHaveBeenCalledWith(
            expect.stringMatching(resultFilePathRegex),
            JSON.stringify(results, null, 2)
        );

        // 检查参数文件是否正确写入（覆盖模式，无时间戳）
        expect(mockWriteFileSync).toHaveBeenCalledWith(
            path.join(argsDir, `${task}.json`),
            JSON.stringify(remainingArgs, null, 2)
        );
    });
});