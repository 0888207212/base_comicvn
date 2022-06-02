import { BaseDocument } from '../../shared/mongoose';
import { Decimal128 } from 'bson';
import { ComicStatus } from './comic.constant';

export interface IComic extends BaseDocument {
  name: string;
  description: string;
  author: string;
  thumbnail: string;
  genreIds: string[];
  status: ComicStatus;
  views: Decimal128;
  rating: Decimal128;
  source: string;
  urlSource: string;
  genres: string[];
  publishDate: Date;
  lastChapterDate: Date;
  isCopyrightedComic: boolean;
}
