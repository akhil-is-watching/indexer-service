import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {

    @Prop()
    signature: string;

    @Prop()
    transaction: string;

    @Prop()
    signer: string;

    @Prop()
    payer: string;

    @Prop()
    retries: number;

    @Prop()
    status: string;

    incrementRetries() {
        this.retries = this.retries + 1;
    }

    setStatus(status: string) {
        this.status = status;
    }
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Explicitly define instance methods in the schema
TransactionSchema.methods.incrementRetries = function() {
    this.retries += 1;
};

TransactionSchema.methods.setStatus = function(status: string) {
    this.status = status;
};