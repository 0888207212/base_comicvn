import { Process, Processor } from '@nestjs/bull';
import { CrawlService } from './crawl.service';
import { Job } from 'bull';
import { PinoLogger } from 'nestjs-pino';
import { BaseProcessor } from '../../app/base.processor';
import { CrawlSingleComicDto } from './crawl.dto';
import { CrawlJob, CrawlQueue } from './crawl.constant';
import { getConfig } from '../common/config.provider';
const config = getConfig();

@Processor(CrawlQueue.CrawlSingleComic)
export class CrawlProcessor extends BaseProcessor {
  constructor(private readonly crawlService: CrawlService, protected readonly logger: PinoLogger) {
    super(logger);
  }

  @Process({
    name: CrawlJob.CrawlSingleComic,
    concurrency: config.get<number>('queue.concurrency'),
  })
  async crawlSingleComic(job: Job) {
    const data = job.data as CrawlSingleComicDto;
    await this.crawlService.crawlSingleTruyenQQ(data);
    return job.id;
  }
}
