import { BaseDocument } from '../../shared/mongoose';

export interface IHistory extends BaseDocument {
  comicId: string;
  userId: string;
  lastReadAt: Date;
  lastReadChapterId: string;
}

export interface CreateOrUpdateHistory {
  comicId: string;
  userId?: string;
  lastReadAt: Date;
  lastReadChapterId: string;
}
