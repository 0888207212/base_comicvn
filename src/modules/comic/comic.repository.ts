import { BaseRepository } from '../../app/base.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IComic } from './comic.interface';

@Injectable()
export class ComicRepository extends BaseRepository<IComic> implements OnApplicationBootstrap {
  constructor(@InjectModel('comic') model: Model<IComic>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
