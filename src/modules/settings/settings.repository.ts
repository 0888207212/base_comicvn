import { BaseRepository } from '../../app/base.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ISetting } from './settings.interface';

@Injectable()
export class SettingRepository extends BaseRepository<ISetting> implements OnApplicationBootstrap {
  constructor(@InjectModel('setting') model: Model<ISetting>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
