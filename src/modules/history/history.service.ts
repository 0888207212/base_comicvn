import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HistoryRepository } from './history.repository';
import { CreateOrUpdateHistory, IHistory } from './history.interface';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { PaginationHeaderHelper } from '../../adapters/pagination/pagination.helper';
import { IndexHistoryFilters } from './history.dto';
import { ComicService } from '../comic/comic.service';

@Injectable()
export class HistoryService {
  constructor(
    private readonly historyRepository: HistoryRepository,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
    @Inject(forwardRef(() => ComicService))
    private readonly comicService: ComicService,
  ) {}

  async findOne(conditions, options?) {
    return this.historyRepository.findOne(conditions, options);
  }

  async createOrUpdate(createHistoryInput: CreateOrUpdateHistory): Promise<IHistory | boolean> {
    if (!createHistoryInput.userId) {
      return false;
    }
    return this.historyRepository.updateOneOrCreate(
      { comicId: createHistoryInput.comicId, userId: createHistoryInput.userId },
      createHistoryInput,
    );
  }

  async index(userId: string, indexHistoryFilters: IndexHistoryFilters, pagination: IPagination) {
    const filter: Record<string, string> = {
      userId,
    };
    const count = await this.historyRepository.count(filter);
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);
    const comics = await this.historyRepository.find(filter, {
      skip: pagination.startIndex,
      limit: pagination.perPage,
      sort: '-createdAt',
    });

    return {
      items: comics,
      headers: responseHeaders,
    };
  }
}
