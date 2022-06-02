import { Controller, Get, HttpStatus, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ComicService } from './comic.service';
import { ChapterResponseDto, ComicResponseDto, IndexChapterFilter } from './comic.dto';
import { PaginationInterceptor } from '../../filters/pagination.filter';
import { Pagination } from '../../decorators/pagination.decorator';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { User } from '../../decorators/user.decorator';

@Controller('comics')
@ApiTags('comics')
export class ComicController {
  constructor(private readonly comicService: ComicService) {}

  @ApiOperation({
    operationId: 'showComic',
    description: 'Show comic',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ComicResponseDto,
  })
  @ApiBearerAuth('access-token')
  @Get(':comicId')
  show(@Param('comicId') comicId: string, @User() userId: string) {
    return this.comicService.show(comicId, true, true, userId);
  }

  @ApiOperation({
    operationId: 'indexComicChapter',
    description: 'indexComicChapter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ChapterResponseDto],
  })
  @UseInterceptors(PaginationInterceptor)
  @Get(':comicId/chapters')
  indexComicChapter(
    @Param('comicId') comicId: string,
    @Query() indexChapterFilter: IndexChapterFilter,
    @Pagination() pagination: IPagination,
  ) {
    return this.comicService.indexComicChapter(comicId, indexChapterFilter, pagination);
  }
}
