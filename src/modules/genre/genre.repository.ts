import { BaseRepository } from '../../app/base.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IGenre } from './genre.interface';

@Injectable()
export class GenreRepository extends BaseRepository<IGenre> implements OnApplicationBootstrap {
  constructor(@InjectModel('genre') model: Model<IGenre>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
