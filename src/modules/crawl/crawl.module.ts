import { HttpModule, Module } from '@nestjs/common';
import { ComicModule } from '../comic/comic.module';
import { CrawlService } from './crawl.service';
import { CrawlController } from './crawl.controller';
import { BullModule } from '@nestjs/bull';
import { CrawlProcessor } from './crawl.processor';
import { GenreModule } from '../genre/genre.module';
import { CrawlChapterProcessor } from './crawl.chapter.processor';
import { CrawlQueue } from './crawl.constant';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlCron } from './crawl.cron';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CrawlQueue.CrawlSingleComic,
    }),
    BullModule.registerQueue({
      name: CrawlQueue.CrawlSingleChapter,
    }),
    BullModule.registerQueue({
      name: CrawlQueue.NotificationQueue,
    }),
    ScheduleModule.forRoot(),
    ComicModule,
    HttpModule,
    GenreModule,
  ],
  providers: [CrawlService, CrawlProcessor, CrawlChapterProcessor, CrawlCron],
  exports: [CrawlService],
  controllers: [CrawlController],
})
export class CrawlModule {}
