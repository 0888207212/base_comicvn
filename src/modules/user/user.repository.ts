import { BaseRepository } from '../../app/base.repository';
import { IUser } from './user.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class UserRepository extends BaseRepository<IUser> implements OnApplicationBootstrap {
  constructor(@InjectModel('user') model: Model<IUser>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
