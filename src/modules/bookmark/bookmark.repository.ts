import { BaseRepository } from '../../app/base.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IBookMark } from './bookmark.interface';

@Injectable()
export class BookmarkRepository
  extends BaseRepository<IBookMark>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel('bookmark') model: Model<IBookMark>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
