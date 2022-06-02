import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IChapter } from './chapter.interface';
import { BaseRepository } from '../../../app/base.repository';

@Injectable()
export class ChapterRepository extends BaseRepository<IChapter> implements OnApplicationBootstrap {
  constructor(@InjectModel('chapter') model: Model<IChapter>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
