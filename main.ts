import { initialize } from "./src/init";
import { missionManager } from "./src/missionManager";

(async () => {
    try {
        const { connection, anchorProvider, umi } = await initialize();

        console.log("Solana environment initialized!");
        console.log("Wallet Public Key:", anchorProvider.wallet.publicKey.toBase58());
        console.log("Connected to Network:", connection.rpcEndpoint);
        console.log("Umi connected wallet", umi.payer.publicKey);



    } catch (error) {
        console.error("Initialization failed:", error);
    }
})();
