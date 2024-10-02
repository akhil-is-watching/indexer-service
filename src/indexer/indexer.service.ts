import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy, EventPattern, Payload } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { SolanaService } from "src/solana/solana.service";
import { TransactionResponseDTO } from "./indexer.dto";
import { Transaction } from "./schema/transaction.schema";

@Injectable()
export class IndexerService {
    constructor(
        private solanaService: SolanaService,
        @Inject("NATS_SERVICE") private natsClient: ClientProxy,
        @InjectModel(Transaction.name) private transactionModel
    ) {}


    async onModuleInit() {
        setInterval(async () => {
            console.log("Checking for pending transactions...")
            await this.checkPendingTransactions();
        }, 7000)
    }

    async getTransaction(signature: string) {
        const transaction = await this.transactionModel.findOne({signature}).exec();
        if(!transaction) {
            throw new Error("Transaction not found");
        }
        return transaction
    }

    @EventPattern({cmd: 'tx.relayed'})
    async createTransaction(@Payload() data: TransactionResponseDTO) {

        console.log(data)

        const result = await this.solanaService.checkTransactionStatus(data.signature);

        const transaction = new this.transactionModel({
            signature: data.signature,
            transaction: data.transaction,
            signer: data.signer,
            payer: data.payer,
            retries: 0,
            status: result
        });

        await transaction.save();
    }

    async _setSignatureStatus(signature: string, status: string) {
        const transaction = await this.transactionModel.findOne({signature});
        transaction.setStatus(status);
        await transaction.save();
    }

    async _incrementRetries(signature: string) {
        const transaction = await this.transactionModel.findOne({signature});
        transaction.incrementRetries();
        await transaction.save();
    }

    async checkPendingTransactions() {
        const transactions = await this.transactionModel.find({status: "PENDING"});
        console.log(`Found ${transactions.length} pending transactions...`);
        const statuses = await this.solanaService.checkTransactionStatuses(transactions.map(transaction => transaction.signature));
        statuses.forEach(async (status, index) => {
            if(status.status == "SUCCESS") {
                await this._setSignatureStatus(status.signature, "SUCCESS");
            } else if(status.status == "FAILED") {
                await this._setSignatureStatus(status.signature, "FAILED");
            } else if(status.status == "PENDING") {
                let tx = await this.getTransaction(status.signature);
                console.log(tx.retries)
                if(tx.retries >= 1 && tx.retries < 10) {
                    await this.solanaService.sendTransaction((await this.getTransaction(status.signature)).transaction);
                } else if(tx.retries >= 10) {
                    await this._setSignatureStatus(status.signature, "DROPPED");
                }
                await this._incrementRetries(status.signature);
            }
        })
    }
}