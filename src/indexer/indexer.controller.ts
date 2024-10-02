import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { TransactionCheckDTO } from "./indexer.dto";
import { IndexerService } from "./indexer.service";

@Controller()
export class IndexerController {

    constructor(private indexerService: IndexerService) {}

    @MessagePattern({ cmd: 'tx.check' })
    async txCheck(@Payload() data: TransactionCheckDTO) {
        console.log(data.signature)
        return this.indexerService.getTransaction(data.signature);
    }

    @EventPattern({ cmd: 'tx.relayed' })
    async txRelayed(@Payload() data: any) {
        console.log(data)
        return this.indexerService.createTransaction(data);
    }

}