import { Module } from '@nestjs/common';
import { ComicModule } from '../comic/comic.module';
import { UserModule } from '../user/user.module';
import { BookmarkRepository } from './bookmark.repository';
import { BookmarkService } from './bookmark.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BookmarkSchema } from './bookmark.schema';
import { BookmarkController } from './bookmark.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'bookmark', schema: BookmarkSchema }]),
    UserModule,
    ComicModule,
  ],
  controllers: [BookmarkController],
  providers: [BookmarkRepository, BookmarkService],
  exports: [BookmarkRepository, BookmarkService],
})
export class BookmarkModule {}
