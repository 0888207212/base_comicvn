import { HttpService, Injectable } from '@nestjs/common';
import { ComicRepository } from '../comic/comic.repository';
import { CrawlSingleComicDto } from './crawl.dto';
import * as cheerio from 'cheerio';
import { Cheerio } from 'cheerio';
import { getNow } from '../../shared/time-helpers';
import { ChapterRepository } from '../comic/chapter/chapter.repository';
import { ComicService } from '../comic/comic.service';
import { CreateComicDto } from '../comic/comic.dto';
import { ComicSource } from '../comic/comic.constant';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CrawlQueue } from './crawl.constant';

@Injectable()
export class CrawlService {
  constructor(
    private readonly comicRepository: ComicRepository,
    private readonly comicService: ComicService,
    private readonly httpService: HttpService,
    private readonly chapterRepository: ChapterRepository,
    @InjectQueue(CrawlQueue.CrawlSingleComic) private crawlQueue: Queue,
  ) {}
  async crawlSingleComic(crawlSingleComicInput: CrawlSingleComicDto) {
    const axiosResponse = await this.httpService.get(crawlSingleComicInput.comicUrl).toPromise();
    const $ = cheerio.load(axiosResponse.data);
    const thumbnail = $('.novel-thumbnail > img');
    const comicInput = {
      thumbnail: thumbnail[0]?.attribs?.src,
      name: thumbnail[0]?.attribs?.alt,
      description: 'Đang cập nhật',
      author: 'Đang cập nhật',
      source: ComicSource.NetTruyen,
      genreIds: ['6136322a62dbb3278c3db93d'],
    } as CreateComicDto;
    const createdComic = await this.comicService.create(comicInput);
    const chapters = $('.chapter-name > h6 > a');
    const chapterData: Cheerio<string> = chapters.map(
      (_, el) => `https://${comicInput.source}${el.attribs.href}`,
    );
    const allChapter = await Promise.all(
      chapterData.map((_, chapter) => this.crawSingleChapter(createdComic.id, chapter)),
    );
    await this.chapterRepository.model.insertMany(allChapter);
    return this.comicService.show(createdComic.id);
  }

  async crawSingleChapter(comicId: string, chapterUrl: any) {
    let payload;
    try {
      const axiosResponse = await this.httpService
        .get(chapterUrl, {
          headers: {
            ['user-agent']:
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
          },
        })
        .toPromise();
      const $ = cheerio.load(axiosResponse.data);
      const titleHtml = $('.chapter-title > h5');
      const chapterName = $(titleHtml[0]).text();
      const images = $('.chapter-images > img');
      const imgArr: string[] = [];
      images.each((i, el) => {
        imgArr.push(el.attribs['data-src'] || el.attribs?.src);
      });
      payload = {
        comicId,
        name: chapterName,
        publishDate: getNow(),
        images: imgArr,
        source: ComicSource.NetTruyen,
      };
    } catch (e) {
      payload = {
        comicId,
        name: `Error: ${chapterUrl}`,
        publishDate: getNow(),
        images: [],
        source: ComicSource.NetTruyen,
      };
    }
    return payload;
  }
}
