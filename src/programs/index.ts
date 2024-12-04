import { SolanaEnv } from "../init";

export enum ProgramFunctions {
    MintNft = "mintNft",
    AnotherProgramFunction = "anotherProgramFunction",
}

export const programs: Record<ProgramFunctions, (env: SolanaEnv, programId: string, args: any) => void> = {
    [ProgramFunctions.MintNft]: (env, programId, args) => {
        console.log("Executing mintNft...");
        console.log("Program ID:", programId);
        console.log("Args:", args);
    },
    [ProgramFunctions.AnotherProgramFunction]: (env, programId, args) => {
        console.log("Executing another program function...");
    },
};
