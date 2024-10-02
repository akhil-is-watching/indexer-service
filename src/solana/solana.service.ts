import { Injectable } from "@nestjs/common";
import { Connection } from "@solana/web3.js";
import { SignatureStatus } from "./solana.types";

@Injectable()
export class SolanaService {

    connection: Connection

    constructor() {
        this.connection = new Connection(process.env.RPC_URL);
    }

    async checkTransactionStatus(signature: string): Promise<string> {
        try {
            const result = await this.connection.getSignatureStatus(signature);

            if(result.value.err != null) {
                return "FAILED";
            } else {
                return "SUCCESS";
            }
        } catch(e) {
            return "PENDING";
        }
    }

    async checkTransactionStatuses(signatures: string[]): Promise<SignatureStatus[]> {
        let results: SignatureStatus[]= [];

        try {
            const statuses = await this.connection.getSignatureStatuses(signatures);
            statuses.value.forEach((status, index) => {
                if(status.err != null) {
                    results.push({ signature: signatures[index], status: "FAILED" });
                } else {
                   results.push({ signature: signatures[index], status: "SUCCESS" });
                }
            });
            return results
        } catch(e) {
            results = signatures.map(signature => ({ signature, status: "PENDING" }));
            return results
        }
    }

    async sendTransaction(transaction: string) {
        const txbuf = Buffer.from(transaction, "base64");
        const signature = await this.connection.sendRawTransaction(txbuf, {
            skipPreflight: true,
            maxRetries: 1
        });
        return signature
    }
}