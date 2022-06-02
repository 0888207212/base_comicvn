import { Process, Processor } from '@nestjs/bull';
import { CrawlJob, CrawlQueue } from '../crawl/crawl.constant';
import { BaseProcessor } from '../../app/base.processor';
import { PinoLogger } from 'nestjs-pino';
import { Job } from 'bull';
import { NotificationService } from './notification.service';

@Processor(CrawlQueue.NotificationQueue)
export class NotificationProcessor extends BaseProcessor {
  constructor(
    private readonly notificationService: NotificationService,
    protected readonly logger: PinoLogger,
  ) {
    super(logger);
  }

  @Process(CrawlJob.NotifyNewChapter)
  async notifyNewChapter(job: Job) {
    const data = job.data;
    await this.notificationService.sendNewChapterNotificationToSubscriber(
      data.comicId,
      data.attempt,
    );
    return job.id;
  }
}
