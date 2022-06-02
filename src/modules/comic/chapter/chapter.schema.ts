import { Decimal128 } from 'bson';
import { IChapter } from './chapter.interface';
import { getBaseSchema } from '../../../shared/mongoose';
import { ComicStatus } from '../comic.constant';
import { ChapterStatus } from './chapter.constant';

const ChapterSchema = getBaseSchema<IChapter>();

ChapterSchema.add({
  comicId: {
    type: String,
    require: true,
  },
  name: {
    type: String,
  },
  images: {
    type: [String],
    default: [],
  },
  publishDate: {
    type: Date,
  },
  views: {
    type: Decimal128,
    default: 0,
  },
  source: {
    type: String,
  },
  urlSource: {
    require: true,
    type: String,
    unique: true,
  },
  isCrawlError: {
    type: Boolean,
    default: false,
  },
  indexSort: {
    type: Number,
  },
  status: {
    type: String,
    default: ChapterStatus.Active,
  },
});

export { ChapterSchema };
