import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CrawlService } from './crawl.service';
import { ComicResponseDto } from '../comic/comic.dto';
import { CrawlMultipleComicDto, CrawlSingleComicDto } from './crawl.dto';

@Controller('crawl')
@ApiTags('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @ApiOperation({
    operationId: 'crawlSingleComic',
    description: 'crawlSingleComic',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @Post('crawlSingleComic')
  search(@Body() crawlSingleComicInput: CrawlSingleComicDto) {
    return this.crawlService.addCrawlJob(crawlSingleComicInput);
  }

  @ApiOperation({
    operationId: 'crawlMultipleComic',
    description: 'crawlMultipleComic',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @Post('crawlMultipleComic')
  crawlMultipleComic(@Body() crawlMultipleComicInput: CrawlMultipleComicDto) {
    return this.crawlService.addBulkCrawlJob(crawlMultipleComicInput);
  }

  @ApiOperation({
    operationId: 'retryFailedChapter',
    description: 'retryFailedChapter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @Get('retryFailedChapter')
  retryFailedChapter() {
    return this.crawlService.retryFailedChapter();
  }

  @ApiOperation({
    operationId: 'crawlNewChapter',
    description: 'crawlNewChapter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @Get('crawlNewChapter')
  crawlNewChapter() {
    return this.crawlService.startCheckNewChapter();
  }

  @ApiOperation({
    operationId: 'startCheckNewComic',
    description: 'startCheckNewComic',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @Get('startCheckNewComic')
  startCheckNewComic() {
    return this.crawlService.startCheckNewComic();
  }
}
