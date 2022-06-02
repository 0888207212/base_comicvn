import { getBaseSchema } from '../../shared/mongoose';
import { IComic } from './comic.interface';
import { Decimal128 } from 'bson';
import { ComicStatus } from './comic.constant';

const ComicSchema = getBaseSchema<IComic>();

ComicSchema.add({
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
  },
  author: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  genreIds: {
    type: [String],
    default: [],
  },
  genres: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    default: ComicStatus.UPDATING,
  },
  views: {
    type: Decimal128,
    default: 0,
  },
  rating: {
    type: Decimal128,
    default: 5,
  },
  source: {
    type: String,
  },
  urlSource: {
    type: String,
    require: true,
    unique: true,
  },
  publishDate: {
    type: Date,
  },
  lastChapterDate: {
    type: Date,
  },
  isCopyrightedComic: {
    type: Boolean,
    default: true,
  },
});

export { ComicSchema };
