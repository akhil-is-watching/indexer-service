
export class TransactionResponseDTO {
    payer: string  
    signer: string
    transaction: string
    signature: string
}

export class TransactionCheckDTO {
    signature: string
}