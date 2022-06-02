import { Controller, Get, HttpStatus, Query, UseInterceptors } from '@nestjs/common';
import { HistoryService } from './history.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookmarkResponseDto, IndexBookmarkFilters } from '../bookmark/bookmark.dto';
import { PaginationInterceptor } from '../../filters/pagination.filter';
import { User } from '../../decorators/user.decorator';
import { Pagination } from '../../decorators/pagination.decorator';
import { IPagination } from '../../adapters/pagination/pagination.interface';

@Controller('histories')
@ApiTags('histories')
@ApiBearerAuth('access-token')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @ApiOperation({
    operationId: 'indexHistory',
    description: 'indexHistory',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [BookmarkResponseDto],
  })
  @UseInterceptors(PaginationInterceptor)
  @Get()
  indexHistory(
    @User() userId: string,
    @Query() indexHistoryFilter: IndexBookmarkFilters,
    @Pagination() pagination: IPagination,
  ) {
    return this.historyService.index(userId, indexHistoryFilter, pagination);
  }
}
