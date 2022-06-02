import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GenreSchema } from './genre.schema';
import { GenreService } from './genre.service';
import { GenreRepository } from './genre.repository';
import { GenreController } from './genre.controller';
import { ComicModule } from '../comic/comic.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'genre', schema: GenreSchema }]),
    forwardRef(() => ComicModule),
  ],
  providers: [GenreService, GenreRepository],
  exports: [GenreService, GenreRepository],
  controllers: [GenreController],
})
export class GenreModule {}
