import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ComicModule } from '../comic/comic.module';
import { UserModule } from '../user/user.module';
import { CrawlModule } from '../crawl/crawl.module';
import { NotificationProcessor } from './notification.processor';
import { BullModule } from '@nestjs/bull';
import { CrawlQueue } from '../crawl/crawl.constant';

@Module({
  imports: [
    ComicModule,
    UserModule,
    CrawlModule,
    BullModule.registerQueue({
      name: CrawlQueue.NotificationQueue,
    }),
  ],
  providers: [NotificationService, NotificationProcessor],
  exports: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
