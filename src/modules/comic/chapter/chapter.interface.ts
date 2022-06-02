import { BaseDocument } from '../../../shared/mongoose';
import { Decimal128 } from 'bson';
import { ComicSource } from '../comic.constant';
import { ChapterStatus } from './chapter.constant';

export interface IChapter extends BaseDocument {
  comicId: string;
  name: string;
  views: Decimal128;
  publishDate: Date;
  images: string[];
  source: ComicSource;
  urlSource?: string;
  isCrawlError?: boolean;
  isRequiredReferer?: boolean;
  indexSort: number;
  status: ChapterStatus;
}
