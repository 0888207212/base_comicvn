import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { ComicModule } from '../comic/comic.module';

@Module({
  imports: [ComicModule],
  controllers: [HomeController],
  providers: [],
  exports: [],
})
export class HomeModule {}
