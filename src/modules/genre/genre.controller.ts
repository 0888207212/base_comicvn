import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenreService } from './genre.service';
import { CreateGenreDto, GenreResponseDto, IndexComicByGenreFilters } from './genre.dto';
import { ComicResponseDto } from '../comic/comic.dto';
import { ComicService } from '../comic/comic.service';
import { PaginationInterceptor } from '../../filters/pagination.filter';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { Pagination } from '../../decorators/pagination.decorator';
import { DynamicContent } from '../../decorators/dynamic.content.decorator';

@Controller('genres')
@ApiTags('genres')
export class GenreController {
  constructor(
    private readonly genreService: GenreService,
    private readonly comicService: ComicService,
  ) {}

  @ApiOperation({
    operationId: 'genres',
    description: 'index genre',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [GenreResponseDto],
  })
  @Get()
  index(@DynamicContent() isHideCopyrightContent: boolean) {
    return this.genreService.index(isHideCopyrightContent);
  }

  @ApiOperation({
    operationId: 'createGenre',
    description: 'Create genre',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GenreResponseDto,
  })
  @Post()
  store(@Body() createGenreInput: CreateGenreDto) {
    return this.genreService.create(createGenreInput);
  }

  @ApiOperation({
    operationId: 'showComicByGenre',
    description: 'Show comic by genre',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @UseInterceptors(PaginationInterceptor)
  @Get(':genreId/comics')
  comics(
    @Param('genreId') genreId: string,
    @Pagination() pagination: IPagination,
    @Query() filters: IndexComicByGenreFilters,
    @DynamicContent() isHideCopyrightContent: boolean,
  ) {
    return this.comicService.indexByGenre(genreId, filters, pagination, isHideCopyrightContent);
  }
}
