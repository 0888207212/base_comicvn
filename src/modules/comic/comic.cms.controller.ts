import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ComicService } from './comic.service';
import {
  ChapterResponseDto,
  ComicResponseDto,
  CreateChapterDto,
  CreateComicDto,
  IndexChapterFilter,
  UpdateComicDto,
} from './comic.dto';
import { PaginationInterceptor } from '../../filters/pagination.filter';
import { Pagination } from '../../decorators/pagination.decorator';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { CmsIndexComicFilters } from '../home/home.dto';
import { DynamicContent } from '../../decorators/dynamic.content.decorator';

@Controller('comics')
@ApiTags('comics.cms')
export class ComicCmsController {
  constructor(private readonly comicService: ComicService) {}

  @ApiOperation({
    operationId: 'createComic',
    description: 'Create comic',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ComicResponseDto,
  })
  @Post()
  store(@Body() createComicInput: CreateComicDto) {
    return this.comicService.create(createComicInput);
  }

  @ApiOperation({
    operationId: 'updateComic',
    description: 'Update comic',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ComicResponseDto,
  })
  @Put(':comicId')
  update(@Param('comicId') comicId: string, @Body() updateComicInput: UpdateComicDto) {
    return this.comicService.update(comicId, updateComicInput);
  }

  @ApiOperation({
    operationId: 'deleteComic',
    description: 'Delete comic',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ComicResponseDto,
  })
  @Delete(':comicId')
  delete(@Param('comicId') comicId: string) {
    return this.comicService.delete(comicId);
  }

  @ApiOperation({
    operationId: 'createChapter',
    description: 'Create chapter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ChapterResponseDto,
  })
  @Post(':comicId/chapter')
  storeChapter(@Param('comicId') comicId: string, @Body() createChapterInput: CreateChapterDto) {
    return this.comicService.createChapter(comicId, createChapterInput);
  }

  @ApiOperation({
    operationId: 'cmsIndexComic',
    description: 'CMS Index Comic',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @UseInterceptors(PaginationInterceptor)
  @Get()
  cmsIndex(
    @Query() searchInput: CmsIndexComicFilters,
    @Pagination() pagination: IPagination,
    @DynamicContent() isHideCopyrightContent: boolean,
  ) {
    return this.comicService.cmsIndex(searchInput, pagination, isHideCopyrightContent);
  }

  @ApiOperation({
    operationId: 'cmsIndexComicChapter',
    description: 'cmsIndexComicChapter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ChapterResponseDto],
  })
  @UseInterceptors(PaginationInterceptor)
  @Get(':comicId/cms/chapters')
  cmsIndexComicChapter(
    @Param('comicId') comicId: string,
    @Query() indexChapterFilter: IndexChapterFilter,
    @Pagination() pagination: IPagination,
  ) {
    return this.comicService.cmsIndexComicChapter(comicId, indexChapterFilter, pagination);
  }
}
