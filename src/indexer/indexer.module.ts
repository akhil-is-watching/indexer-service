import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NatsModule } from "src/nats/nats.module";
import { SolanaModule } from "src/solana/solana.module";
import { IndexerController } from "./indexer.controller";
import { IndexerService } from "./indexer.service";
import { Transaction, TransactionSchema } from "./schema/transaction.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Transaction.name, schema: TransactionSchema }
        ]), 
        SolanaModule, 
        NatsModule 
    ],
    controllers: [ IndexerController ],
    providers: [ IndexerService ],
})
export class IndexerModule {}