import { Process, Processor } from '@nestjs/bull';
import { CrawlService } from './crawl.service';
import { Job } from 'bull';
import { PinoLogger } from 'nestjs-pino';
import { BaseProcessor } from '../../app/base.processor';
import { CrawlJob, CrawlQueue } from './crawl.constant';
import { getConfig } from '../common/config.provider';
const config = getConfig();

@Processor(CrawlQueue.CrawlSingleChapter)
export class CrawlChapterProcessor extends BaseProcessor {
  constructor(private readonly crawlService: CrawlService, protected readonly logger: PinoLogger) {
    super(logger);
  }

  @Process({
    name: CrawlJob.CrawlSingleChapter,
    concurrency: config.get<number>('queue.concurrency'),
  })
  async crawlSingleChapter(job: Job) {
    const data = job.data;
    await this.crawlService.crawlSingleChapter(
      data.url,
      data.comicId,
      data.index,
      data.date,
      data.attempt,
      data.isNotifyToSubscriber,
    );
    return job.id;
  }

  @Process({
    name: CrawlJob.CheckSingleChapter,
    concurrency: config.get<number>('queue.concurrency'),
  })
  async checkSingleChapter(job: Job) {
    const data = job.data;
    await this.crawlService.checkLastChapter(data.comicUrl);
    return job.id;
  }
}
