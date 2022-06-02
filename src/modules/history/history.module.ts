import { forwardRef, Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { HistorySchema } from './history.schema';
import { HistoryRepository } from './history.repository';
import { ComicModule } from '../comic/comic.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'history', schema: HistorySchema }]),
    forwardRef(() => ComicModule),
  ],
  controllers: [HistoryController],
  providers: [HistoryService, HistoryRepository],
  exports: [HistoryService, HistoryRepository],
})
export class HistoryModule {}
