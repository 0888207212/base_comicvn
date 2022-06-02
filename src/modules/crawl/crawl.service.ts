import { HttpService, Inject, Injectable } from '@nestjs/common';
import { ComicRepository } from '../comic/comic.repository';
import { CrawlMultipleComicDto, CrawlSingleComicDto } from './crawl.dto';
import * as cheerio from 'cheerio';
import { DateTime } from 'luxon';
import { getNow } from '../../shared/time-helpers';
import { ChapterRepository } from '../comic/chapter/chapter.repository';
import { ComicService } from '../comic/comic.service';
import { ComicSource, ComicStatus } from '../comic/comic.constant';
import { InjectQueue } from '@nestjs/bull';
import Bull, { Queue } from 'bull';
import { IConfig } from 'config';
import { GenreRepository } from '../genre/genre.repository';
import { CheerioAPI } from 'cheerio/lib/load';
import { PinoLogger } from 'nestjs-pino';
import { CrawlJob, CrawlQueue, maxAttempt } from './crawl.constant';
import { SendTestNotificationQueueDto } from '../notification/notification.dto';
import { CONFIG } from '../config/config.provider';
import { getRandomInt } from '../../shared/helpers';

@Injectable()
export class CrawlService {
  constructor(
    private readonly comicRepository: ComicRepository,
    private readonly comicService: ComicService,
    private readonly httpService: HttpService,
    private readonly chapterRepository: ChapterRepository,
    protected readonly genreRepository: GenreRepository,
    private readonly logger: PinoLogger,
    @InjectQueue(CrawlQueue.CrawlSingleComic) private crawlQueue: Queue,
    @InjectQueue(CrawlQueue.CrawlSingleChapter) private crawlChapterQueue: Queue,
    @InjectQueue(CrawlQueue.NotificationQueue) private notificationQueue: Queue,
    @Inject(CONFIG) private readonly config: IConfig,
  ) {}

  async sendTestNotificationQueue(notificationInput: SendTestNotificationQueueDto) {
    return this.notificationQueue.add(
      CrawlJob.NotifyNewChapter,
      {
        comicId: notificationInput.comicId,
      },
      { removeOnComplete: true },
    );
  }

  async retryFailedChapter() {
    const failedChapter = await this.chapterRepository.find({ isCrawlError: true });
    let baseDelay = this.config.get<number>('queue.delay');
    const retryEnqueueData = failedChapter.map((chapter) => {
      baseDelay += this.config.get<number>('queue.stepDelay');
      return {
        name: CrawlJob.CrawlSingleChapter,
        data: { url: chapter.urlSource, comicId: chapter.comicId, date: null },
        opts: { delay: baseDelay, removeOnComplete: true },
      };
    });
    await this.chapterRepository.deleteMany({ isCrawlError: true });
    await this.crawlChapterQueue.addBulk(retryEnqueueData);

    return {
      retryAmount: retryEnqueueData.length,
    };
  }

  async addBulkCrawlJob(crawlMultipleComicInput: CrawlMultipleComicDto) {
    let baseDelay = this.config.get<number>('queue.delay');
    const crawlMultipleComicEnqueueData = crawlMultipleComicInput.comicUrls.map((url) => {
      baseDelay += this.config.get<number>('queue.stepDelay');
      return {
        name: CrawlJob.CrawlSingleComic,
        data: { comicUrl: url, isCopyrightedComic: crawlMultipleComicInput.isCopyrightedComic },
        opts: { delay: baseDelay + getRandomInt(10000, 600000), removeOnComplete: true },
      };
    });

    return this.crawlQueue.addBulk(crawlMultipleComicEnqueueData);
  }

  async addCrawlJob(crawlSingleComicInput: CrawlSingleComicDto): Promise<Bull.Job<any>> {
    return this.crawlQueue.add(CrawlJob.CrawlSingleComic, crawlSingleComicInput, {
      removeOnComplete: true,
    });
  }

  async crawlSingleTruyenQQ(crawlSingleComicInput: CrawlSingleComicDto) {
    if (!crawlSingleComicInput.comicUrl) {
      this.logger.info(`Comic url = ${crawlSingleComicInput.comicUrl} is invalid`);
      return 0;
    }

    const isComicCrawled = await this.comicRepository.exists({
      urlSource: { $regex: new RegExp(new URL(crawlSingleComicInput.comicUrl).pathname, 'i') },
    });
    const $ = await this.fetchHtmlResponse(crawlSingleComicInput.comicUrl);
    const [info, chapterInfo] = await Promise.all([
      this.crawlComicInfo($),
      this.crawlChapterList($),
    ]);
    if (!info) {
      this.logger.info(`Comic url = ${crawlSingleComicInput.comicUrl} has invalid HTML structure`);
      return 0;
    }
    if (isComicCrawled) {
      await this.comicService.create({
        ...info,
        urlSource: crawlSingleComicInput.comicUrl,
        isCopyrightedComic: crawlSingleComicInput.isCopyrightedComic || true,
        source: ComicSource.TruyenQQVip,
      });

      this.logger.info(`Comic url = ${crawlSingleComicInput.comicUrl} is crawled`);
      return 0;
    }
    const createdComic = await this.comicService.create({
      ...info,
      urlSource: crawlSingleComicInput.comicUrl,
      isCopyrightedComic: crawlSingleComicInput.isCopyrightedComic || true,
      source: ComicSource.TruyenQQVip,
    });
    const chapterEnqueueData = [];
    let baseDelay = this.config.get<number>('queue.delay');
    const chapterCount = chapterInfo.length;
    chapterInfo.each((i, chapter) => {
      baseDelay += this.config.get<number>('queue.stepDelay');
      chapterEnqueueData.push({
        name: CrawlJob.CrawlSingleChapter,
        data: {
          url: chapter.url,
          comicId: createdComic.id,
          date: chapter.date,
          index: chapterCount - (i + 1),
        },
        opts: { delay: baseDelay + getRandomInt(10000, 600000), removeOnComplete: true },
      });
    });
    await this.crawlChapterQueue.addBulk(chapterEnqueueData);
    return createdComic.id;
  }

  async crawlComicInfo($: CheerioAPI) {
    const thumbnailAndNameEl = $(
      'body > div.outsite > section.main-content > div > div.block01 > div.left > img',
    );
    const authorEl = $(
      'body > div.outsite > section.main-content > div > div.block01 > div.center > div:nth-child(2) > p:nth-child(2) > a',
    );
    const statusEl = $(
      'body > div.outsite > section.main-content > div > div.block01 > div.center > div:nth-child(2) > p:nth-child(3)',
    );
    const genreEl = $(
      'body > div.outsite > section.main-content > div > div.block01 > div.center > ul.list01 > li > a',
    );
    const descriptionEl = $('.story-detail-info > p');
    const pEl = $(descriptionEl[0]);
    const name: string = thumbnailAndNameEl[0]?.attribs?.alt?.trim();
    const thumbnail: string = thumbnailAndNameEl[0]?.attribs?.src?.trim();
    const author: string = authorEl['0']?.children['0']?.data?.trim() ?? ComicStatus.UPDATING;
    const status: string =
      statusEl['0']?.children['0']?.data?.split(':')?.pop()?.trim() ?? ComicStatus.UPDATING;
    const description: string = pEl?.text()?.trim() ?? ComicStatus.UPDATING;
    const genreTexts: string[] = [];
    genreEl.each((i, el) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      el.children.forEach((el2) => genreTexts.push(el2.data?.trim()));
    });
    const searchGenreRes = await Promise.all(
      genreTexts.map((g) =>
        this.genreRepository.findOne(
          { name: { $regex: new RegExp(g, 'i') } },
          { projection: { _id: 1 } },
        ),
      ),
    );

    if (!name || !thumbnail) {
      return false;
    }

    return {
      name,
      thumbnail,
      author,
      status,
      description,
      source: ComicSource.TruyenQQVip,
      genreIds: searchGenreRes.filter((g) => g).map((g) => g?.id),
    };
  }

  async crawlChapterList($: CheerioAPI) {
    const chapterContainers = $('.works-chapter-item');

    return chapterContainers.map((i, el) => ({
      date: el.children['3']?.children['0']?.data?.trim(),
      url: el.children['1']?.children['1']?.attribs?.href?.trim(),
    }));
  }

  async crawlSingleChapter(
    chapterUrl: string,
    comicId: string,
    index: number,
    date?: string,
    attempt = 0,
    isNotifyToSubscriber = false,
  ) {
    if (attempt > 0) {
      this.logger.info(`Retrying crawl chapter: ${chapterUrl}, attempt = ${attempt}`);
    }
    if (attempt > maxAttempt) {
      const errorPayload = {
        isCrawlError: true,
        urlSource: chapterUrl,
        source: ComicSource.TruyenQQVip,
        name: `Error: Đang cập nhật...`,
        publishDate: getNow().setFullYear(2000, 0, 1),
        images: [],
        comicId,
      };
      await this.chapterRepository.updateOneOrCreate(
        {
          urlSource: { $regex: new RegExp(new URL(chapterUrl).pathname, 'i') },
        },
        errorPayload,
      );

      return {
        chapterUrl,
        status: 'failed',
      };
    }
    let payload;
    try {
      const $ = await this.fetchHtmlResponse(chapterUrl);

      const chapterNameEL = $(
        'body > div.outsite.on > section.main-content.on > div.story-see.container > div.story-see-main > div > div:nth-child(1) > div:nth-child(2) > h1',
      );
      const imageEls = $(
        'body > div.outsite.on > section.main-content.on > div.story-see.container > div.story-see-main > div > div.story-see-content > img',
      );
      const chapterName =
        chapterNameEL['0']?.children['1']?.data?.trim() || `Chapter: đang cập nhật`;

      let publishDate = null;

      if (date) {
        publishDate = DateTime.fromFormat(date, 'dd/MM/yyyy').toJSDate();
      }
      if (!date) {
        const updateTime = $(
          'body > div.outsite.on > section.main-content.on > div.story-see.container > div.story-see-main > div > div:nth-child(1) > div:nth-child(2) > time',
        );
        publishDate = DateTime.fromJSDate(new Date(updateTime['0']?.attribs?.datetime)).startOf(
          'day',
        );
      }
      const images: string[] = [];
      imageEls.each((_, el) => {
        images.push(
          el.attribs['data-cnd']?.trim() ||
            el.attribs['data-original']?.trim() ||
            el.attribs?.src?.trim(),
        );
      });

      payload = {
        isCrawlError: false,
        urlSource: chapterUrl,
        source: ComicSource.TruyenQQVip,
        name: chapterName,
        indexSort: index,
        publishDate,
        images,
        comicId,
      };

      const chapter = await this.chapterRepository.updateOneOrCreate(
        { urlSource: { $regex: new RegExp(new URL(chapterUrl).pathname, 'i') } },
        payload,
      );

      if (isNotifyToSubscriber) {
        this.notificationQueue.add(
          CrawlJob.NotifyNewChapter,
          { comicId },
          { removeOnComplete: true },
        );
      }

      await this.comicRepository.updateById(comicId, {
        lastChapterDate: getNow(),
      });
      if (index === 1) {
        await this.comicRepository.updateById(comicId, {
          publishDate,
          lastChapterDate: publishDate,
        });
      }
      return chapter.id;
    } catch (e) {
      this.logger.error(e.message);
      await this.crawlChapterQueue.add(
        CrawlJob.CrawlSingleChapter,
        { url: chapterUrl, comicId, date, attempt: ++attempt, index, isNotifyToSubscriber },
        {
          delay: this.config.get<number>('queue.retryDelay') + getRandomInt(10000, 600000),
          removeOnComplete: true,
        },
      );
    }
  }

  async startCheckNewChapter() {
    const baseUrl = 'http://truyenqqvip.com/truyen-moi-cap-nhat.html';
    const $ = await this.fetchHtmlResponse(baseUrl);
    const comicUrlEls = $(
      'body > div.outsite > section.main-content > div > div.tile.is-ancestor > div > ul > li > div > a',
    );
    const comicUrls: string[] = [];
    comicUrlEls.map((i, el) => {
      if (el?.attribs?.href) {
        comicUrls.push(el?.attribs?.href);
      }
    });
    if (comicUrls.length <= 0) {
      return 0;
    }

    let baseDelay = this.config.get<number>('queue.delay');
    const checkSingleChapterEnqueueData = comicUrls.map((url) => {
      baseDelay += this.config.get<number>('queue.stepDelay');
      return {
        name: CrawlJob.CheckSingleChapter,
        data: { comicUrl: url },
        opts: { removeOnComplete: true, delays: baseDelay + getRandomInt(10000, 600000) },
      };
    });
    await this.crawlChapterQueue.addBulk(checkSingleChapterEnqueueData);
  }

  async checkLastChapter(comicUrl: string, attempt = 0) {
    if (!comicUrl) {
      this.logger.info(`Undefined comicURL`);
      return 0;
    }
    const comic = await this.comicRepository.findOne({
      urlSource: { $regex: new RegExp(new URL(comicUrl).pathname, 'i') },
    });
    if (!comic) {
      await this.crawlQueue.add(
        CrawlJob.CrawlSingleComic,
        { comicUrl, isCopyrightedComic: true },
        {
          removeOnComplete: true,
          delay: this.config.get<number>('queue.stepDelay') + getRandomInt(10000, 600000),
        },
      );
      return 1;
    }

    const comicId = comic.id;
    if (attempt > 0) {
      this.logger.info(`Retrying check new chapter for comic: ${comicId}, attempt = ${attempt}`);
    }
    if (attempt > maxAttempt) {
      return 0;
    }

    const lastChapters = await this.chapterRepository.findOne(
      { comicId, isCrawlError: false },
      { sort: { indexSort: -1, name: -1 }, projection: { urlSource: 1, indexSort: 1 } },
    );
    if (!lastChapters?.urlSource) {
      return 0;
    }
    try {
      const $ = await this.fetchHtmlResponse(lastChapters.urlSource);
      const nextChapterEls = $(
        'body > div.outsite.on > section.main-content.on > div.story-see.container > div.story-see-main > div > div:nth-child(1) > div.chapter-control > div.d-flex.align-items-center.justify-content-center > a:nth-child(2)',
      );
      const nextChapterUrl = nextChapterEls['0']?.attribs?.href;
      if (nextChapterUrl && nextChapterUrl !== '#') {
        await this.crawlChapterQueue.add(
          CrawlJob.CrawlSingleChapter,
          {
            url: nextChapterUrl,
            comicId,
            index: ++lastChapters.indexSort,
            isNotifyToSubscriber: true,
          },
          {
            removeOnComplete: true,
            // Will be crawl new chapter after...
            delay: this.config.get<number>('queue.retryDelay') + getRandomInt(10000, 600000),
          },
        );
      }
      return 0;
    } catch (e) {
      this.logger.error(e.message);
      await this.crawlChapterQueue.add(
        CrawlJob.CheckSingleChapter,
        { comicId, attempt: ++attempt },
        {
          delay: this.config.get<number>('queue.retryDelay') + getRandomInt(10000, 600000),
          removeOnComplete: true,
        },
      );
    }
  }

  async startCheckNewComic(): Promise<void> {
    const baseUrl =
      'http://truyenqqvip.com/tim-kiem-nang-cao.html?category=&notcategory=&country=0&status=-1&minchapter=0&sort=0';

    const $ = await this.fetchHtmlResponse(baseUrl);
    const comicUrlEls = $(
      'body > div.outsite > section.main-content > div > div.tile.is-ancestor > div > ul > li > div > a',
    );
    const comicUrls: string[] = [];
    comicUrlEls.map((i, el) => {
      comicUrls.push(el?.attribs?.href);
    });
    if (comicUrls.length > 0) {
      await this.addBulkCrawlJob({ comicUrls, isCopyrightedComic: true });
    }
  }

  private async fetchHtmlResponse(url: string): Promise<CheerioAPI> {
    const newUrl = url.replace('truyenqqtop.com', 'truyenqqvip.com');
    const cookieRes = await this.httpService
      .get(newUrl, {
        headers: {
          ['user-agent']:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
          referer: 'http://truyenqqvip.com/',
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        },
      })
      .toPromise();
    const cookie = cookieRes.data.split(/"(.*?)"/)[1];
    const axiosResponse = await this.httpService
      .get(newUrl, {
        headers: {
          ['user-agent']:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
          referer: 'http://truyenqqvip.com/',
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          cookie,
        },
      })
      .toPromise();
    return cheerio.load(axiosResponse.data);
  }
}
