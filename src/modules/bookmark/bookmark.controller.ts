import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookmarkService } from './bookmark.service';
import {
  BookmarkResponseDto,
  CreateBookMarkDto,
  DeleteBookMarkDto,
  IndexBookmarkFilters,
} from './bookmark.dto';
import { User } from '../../decorators/user.decorator';
import { Pagination } from '../../decorators/pagination.decorator';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { PaginationInterceptor } from '../../filters/pagination.filter';

@Controller('bookmarks')
@ApiTags('bookmarks')
@ApiBearerAuth('access-token')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @ApiOperation({
    operationId: 'createBookmark',
    description: 'createBookmark',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: BookmarkResponseDto,
  })
  @Post()
  create(@User() userId: string, @Body() createBookmarkInput: CreateBookMarkDto) {
    return this.bookmarkService.create(userId, createBookmarkInput);
  }

  @ApiOperation({
    operationId: 'indexBookmark',
    description: 'indexBookmark',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: BookmarkResponseDto,
  })
  @UseInterceptors(PaginationInterceptor)
  @Get()
  indexBookmark(
    @User() userId: string,
    @Query() indexBookmarkFilter: IndexBookmarkFilters,
    @Pagination() pagination: IPagination,
  ) {
    return this.bookmarkService.index(userId, indexBookmarkFilter, pagination);
  }

  @ApiOperation({
    operationId: 'deleteBookmark',
    description: 'deleteBookmark',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: BookmarkResponseDto,
  })
  @Put()
  delete(@User() userId: string, @Body() deleteBookmarkInput: DeleteBookMarkDto) {
    return this.bookmarkService.delete(userId, deleteBookmarkInput);
  }
}
