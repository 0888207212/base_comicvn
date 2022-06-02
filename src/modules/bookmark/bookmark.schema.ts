import { getBaseSchema } from '../../shared/mongoose';
import { IBookMark } from './bookmark.interface';

const BookmarkSchema = getBaseSchema<IBookMark>();

BookmarkSchema.add({
  userId: {
    type: String,
  },
  comicId: {
    type: String,
  },
  bookmarkedAt: {
    type: Date,
  },
});

export { BookmarkSchema };
