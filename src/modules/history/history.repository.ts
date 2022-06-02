import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BaseRepository } from '../../app/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IHistory } from './history.interface';

@Injectable()
export class HistoryRepository extends BaseRepository<IHistory> implements OnApplicationBootstrap {
  constructor(@InjectModel('history') model: Model<IHistory>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
