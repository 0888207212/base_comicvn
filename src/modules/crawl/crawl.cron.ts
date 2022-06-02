import { Injectable } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { PinoLogger } from 'nestjs-pino';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CrawlCron {
  constructor(private readonly crawlService: CrawlService, private readonly logger: PinoLogger) {}

  @Cron(CronExpression.EVERY_HOUR)
  async startCheckNewChapter() {
    this.logger.info('Starting checkNewChapter()');
    await this.crawlService.startCheckNewChapter();
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async startCheckNewComic() {
    this.logger.info('Starting startCheckNewComic()');
    await this.crawlService.startCheckNewComic();
  }
}
