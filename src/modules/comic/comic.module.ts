import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComicSchema } from './comic.schema';
import { ComicService } from './comic.service';
import { ComicRepository } from './comic.repository';
import { ChapterSchema } from './chapter/chapter.schema';
import { ComicController } from './comic.controller';
import { GenreModule } from '../genre/genre.module';
import { ChapterRepository } from './chapter/chapter.repository';
import { ChapterController } from './chapter/chapter.controller';
import { HistoryModule } from '../history/history.module';
import { BookmarkModule } from '../bookmark/bookmark.module';
import { ComicCmsController } from './comic.cms.controller';

@Module({
  imports: [
    // forwardRef(() => HistoryModule),
    HistoryModule,
    forwardRef(() => BookmarkModule),
    MongooseModule.forFeature([
      { name: 'comic', schema: ComicSchema },
      { name: 'chapter', schema: ChapterSchema },
    ]),
    forwardRef(() => GenreModule),
  ],
  controllers: [ComicController, ChapterController, ComicCmsController],
  providers: [ComicService, ComicRepository, ChapterRepository],
  exports: [ComicService, ComicRepository, ChapterRepository],
})
export class ComicModule {}
