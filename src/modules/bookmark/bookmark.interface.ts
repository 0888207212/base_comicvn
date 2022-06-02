import { BaseDocument } from '../../shared/mongoose';

export interface IBookMark extends BaseDocument {
  userId: string;
  comicId: string;
  bookmarkedAt: Date;
}
