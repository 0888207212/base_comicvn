import { Controller, Get, HttpStatus, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ComicService } from '../comic/comic.service';
import {
  HomeResponseDto,
  NewComicFilter,
  RecentlyUpdateComicFilter,
  SearchComicFilters,
  TopFilter,
  TrendingComicFilter,
} from './home.dto';
import { ComicResponseDto } from '../comic/comic.dto';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { TopType } from './home.constant';
import { Pagination } from '../../decorators/pagination.decorator';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { PaginationInterceptor } from '../../filters/pagination.filter';
import { DynamicContent } from '../../decorators/dynamic.content.decorator';

@Controller('home')
@ApiTags('home')
export class HomeController {
  constructor(private readonly comicService: ComicService) {}

  @ApiOperation({
    operationId: 'home',
    description: 'home',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: HomeResponseDto,
  })
  @Get()
  home(@DynamicContent() isHideCopyrightContent: boolean) {
    return this.comicService.home(isHideCopyrightContent);
  }

  @ApiOperation({
    operationId: 'homeVer2',
    description: 'homeVer2',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: HomeResponseDto,
  })
  @Get('v2')
  homeVer2(@DynamicContent() isHideCopyrightContent: boolean) {
    return this.comicService.homeVer2(isHideCopyrightContent);
  }

  @ApiOperation({
    operationId: 'top',
    description: 'top',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @UseInterceptors(PaginationInterceptor)
  @ApiImplicitQuery({ type: String, name: 'type', enum: TopType })
  @Get('top')
  top(
    @Query('type') type: TopType,
    @Query() topFilters: TopFilter,
    @Pagination() pagination: IPagination,
    @DynamicContent() isHideCopyrightContent: boolean,
  ) {
    return this.comicService.top(type, pagination, isHideCopyrightContent);
  }

  @ApiOperation({
    operationId: 'search',
    description: 'search',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @UseInterceptors(PaginationInterceptor)
  @Get('search')
  search(
    @Query() searchInput: SearchComicFilters,
    @Pagination() pagination: IPagination,
    @DynamicContent() isHideCopyrightContent: boolean,
  ) {
    return this.comicService.search(searchInput, pagination, isHideCopyrightContent);
  }

  @ApiOperation({
    operationId: 'trending',
    description: 'trending',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @UseInterceptors(PaginationInterceptor)
  @Get('trending')
  trending(
    @Query() trendingFilter: TrendingComicFilter,
    @Pagination() pagination: IPagination,
    @DynamicContent() isHideCopyrightContent: boolean,
  ) {
    return this.comicService.trending(trendingFilter, pagination, isHideCopyrightContent);
  }

  @ApiOperation({
    operationId: 'new',
    description: 'new',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @UseInterceptors(PaginationInterceptor)
  @Get('new')
  new(
    @Query() newFilter: NewComicFilter,
    @Pagination() pagination: IPagination,
    @DynamicContent() isHideCopyrightContent: boolean,
  ) {
    return this.comicService.new(newFilter, pagination, isHideCopyrightContent);
  }

  @ApiOperation({
    operationId: 'newVer2',
    description: 'newVer2',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @UseInterceptors(PaginationInterceptor)
  @Get('new/v2')
  newVer2(
    @Query() newFilter: NewComicFilter,
    @Pagination() pagination: IPagination,
    @DynamicContent() isHideCopyrightContent: boolean,
  ) {
    return this.comicService.newVer2(newFilter, pagination, isHideCopyrightContent);
  }

  @ApiOperation({
    operationId: 'recentlyUpdate',
    description: 'recentlyUpdate',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ComicResponseDto],
  })
  @UseInterceptors(PaginationInterceptor)
  @Get('recentlyUpdate')
  recentlyUpdate(
    @Query() filter: RecentlyUpdateComicFilter,
    @Pagination() pagination: IPagination,
    @DynamicContent() isHideCopyrightContent: boolean,
  ) {
    return this.comicService.recentlyUpdate(filter, pagination, isHideCopyrightContent);
  }
}
