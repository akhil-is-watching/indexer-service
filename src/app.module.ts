import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IndexerModule } from './indexer/indexer.module';


@Module({
  imports: [ 
    IndexerModule,
    MongooseModule.forRoot(process.env.MONGO_URL)
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
