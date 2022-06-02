import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { IConfig } from 'config';
import { ComicRepository } from './comic.repository';
import { GenreRepository } from '../genre/genre.repository';
import {
  ChapterResponseDto,
  ComicResponseDto,
  CreateChapterDto,
  CreateComicDto,
  IndexChapterFilter,
} from './comic.dto';
import { ChapterRepository } from './chapter/chapter.repository';
import { IChapter } from './chapter/chapter.interface';
import { PaginationHeaderHelper } from '../../adapters/pagination/pagination.helper';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { IndexComicByGenreFilters } from '../genre/genre.dto';
import { HomeListingAmount, TopType } from '../home/home.constant';
import {
  CmsIndexComicFilters,
  NewComicFilter,
  SearchComicFilters,
  TrendingComicFilter,
} from '../home/home.dto';
import { ComicStatus, featureHardCoded, RequireRefererMap, Sort } from './comic.constant';
import { HistoryService } from '../history/history.service';
import { getNow } from '../../shared/time-helpers';
import { BookmarkRepository } from '../bookmark/bookmark.repository';
import { CONFIG } from '../config/config.provider';
import { IComic } from './comic.interface';
import { ChapterStatus } from './chapter/chapter.constant';

@Injectable()
export class ComicService {
  constructor(
    private readonly comicRepository: ComicRepository,
    private readonly genreRepository: GenreRepository,
    private readonly chapterRepository: ChapterRepository,
    @Inject(forwardRef(() => HistoryService))
    private readonly historyService: HistoryService,
    private readonly bookMarkRepository: BookmarkRepository,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
    @Inject(CONFIG) private readonly config: IConfig,
  ) {}

  async createChapter(comicId: string, createChapterInput: CreateChapterDto): Promise<IChapter> {
    const comic = await this.comicRepository.findById(comicId);
    if (!comic) {
      throw new BadRequestException('Comic not found');
    }

    return this.chapterRepository.updateOneOrCreate(
      { urlSource: { $regex: new RegExp(new URL(createChapterInput.urlSource).pathname, 'i') } },
      { comicId, ...createChapterInput, source: comic.source },
    );
  }

  async updateChapter(chapterId: string, updateChapterInput: CreateChapterDto): Promise<IChapter> {
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) {
      throw new BadRequestException('Comic not found');
    }

    return this.chapterRepository.updateById(chapterId, updateChapterInput);
  }

  async deleteChapter(chapterId: string): Promise<IChapter> {
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) {
      throw new BadRequestException('Comic not found');
    }

    return this.chapterRepository.updateById(chapterId, { status: ChapterStatus.Deleted });
  }

  async create(createComicInput: CreateComicDto) {
    const genres = await this.genreRepository.find({ _id: { $in: createComicInput.genreIds } });
    if (genres.length !== createComicInput.genreIds.length) {
      throw new BadRequestException('Invalid genre id in GenreIds[]');
    }
    const comic = await this.comicRepository.updateOneOrCreate(
      { urlSource: { $regex: new RegExp(new URL(createComicInput.urlSource).pathname, 'i') } },
      {
        ...createComicInput,
        genres: genres.map((g) => g.name),
      },
    );
    await this.genreRepository.updateMany(
      { _id: { $in: createComicInput.genreIds } },
      { $inc: { total: 1 } },
    );

    return comic;
  }

  async update(comicId: string, createComicInput: CreateComicDto) {
    const genres = await this.genreRepository.find({ _id: { $in: createComicInput.genreIds } });
    if (genres.length !== createComicInput.genreIds.length) {
      throw new BadRequestException('Invalid genre id in GenreIds[]');
    }

    return this.comicRepository.updateById(comicId, {
      ...createComicInput,
      genres: genres.map((g) => g.name),
    });
  }

  async delete(comicId: string): Promise<IComic> {
    const comic = await this.comicRepository.findById(comicId);
    if (!comic) {
      throw new BadRequestException('Comic not found');
    }

    return this.comicRepository.updateById(comicId, { status: ComicStatus.DELETED });
  }

  async showChapter(chapterId: string, userId?: string): Promise<ChapterResponseDto> {
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) {
      throw new BadRequestException('Comic not found');
    }
    const indexSort = chapter.indexSort;
    const nextChapIndexSort = indexSort + 1;
    const prevChapIndexSort = indexSort - 1;
    const [prevChapter, nextChapter] = await Promise.all([
      this.chapterRepository.findOne({ comicId: chapter.comicId, indexSort: prevChapIndexSort }),
      this.chapterRepository.findOne({ comicId: chapter.comicId, indexSort: nextChapIndexSort }),
      this.chapterRepository.updateById(chapterId, { $inc: { views: 1 } }),
      this.historyService.createOrUpdate({
        userId,
        comicId: chapter.comicId,
        lastReadAt: getNow(),
        lastReadChapterId: chapterId,
      }),
    ]);

    return {
      ...chapter.toObject(),
      isRequiredReferer: RequireRefererMap.get(chapter.source) || false,
      prevChapter: prevChapter?.id || null,
      nextChapter: nextChapter?.id || null,
    };
  }

  async show(
    comicId: string,
    isRequireFirstChapter = false,
    isRequireNumberOfChapter = false,
    userId?: string,
  ): Promise<ComicResponseDto> {
    const comic = await this.comicRepository.findById(comicId);
    if (!comic) {
      throw new BadRequestException('Comic not found');
    }
    // TODO: Optimize increase views
    this.comicRepository.updateById(comicId, { $inc: { views: 1 } });

    let numberOfChapters = null;
    if (isRequireNumberOfChapter) {
      numberOfChapters = await this.chapterRepository.count({ comicId });
    }

    let firstChapterId;
    if (isRequireFirstChapter) {
      const firstChap = await this.chapterRepository.findOne(
        { comicId },
        { sort: { indexSort: 1, name: 1 }, projection: { _id: 1 } },
      );
      firstChapterId = firstChap?.id;
    }
    const comicRes = comic.toObject();

    let isFollowed = false;
    let history = null;
    let lastChapter = null;

    if (userId) {
      const bookmark = await this.bookMarkRepository.findOne({
        userId,
        comicId,
      });
      if (bookmark) {
        isFollowed = true;
      }
      history = await this.historyService.findOne({ comicId, userId });
      if (history) {
        lastChapter = await this.chapterRepository.findById(history.lastReadChapterId, {
          projection: { id: 1, indexSort: 1, name: 1 },
        });
      }
    }

    return {
      ...comicRes,
      numberOfChapters,
      firstChapterId,
      isFollowed,
      lastReadChapterId: history?.lastReadChapterId,
      lastReadChapterIndexSort: lastChapter?.indexSort,
      lastReadChapterName: lastChapter?.name,
    };
  }

  async indexComicChapter(
    comicId: string,
    indexChapterFilter: IndexChapterFilter,
    pagination: IPagination,
  ) {
    const sort = indexChapterFilter.sort || Sort.Desc;
    const sortFilter = sort === Sort.Desc ? { indexSort: -1, name: -1 } : { indexSort: 1, name: 1 };
    const comic = await this.comicRepository.findById(comicId);
    if (!comic) {
      throw new BadRequestException('Comic not found');
    }
    const count = await this.chapterRepository.count({ comicId });
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);
    const chapters = await this.chapterRepository.find(
      { comicId, status: { $ne: ChapterStatus.Deleted } },
      {
        projection: {
          name: 1,
          id: 1,
          views: 1,
          publishDate: 1,
          comicId: 1,
          source: 1,
          indexSort: 1,
        },
        sort: sortFilter,
        skip: pagination.startIndex,
        limit: pagination.perPage,
      },
    );

    return {
      items: chapters,
      headers: responseHeaders,
    };
  }

  async cmsIndexComicChapter(
    comicId: string,
    indexChapterFilter: IndexChapterFilter,
    pagination: IPagination,
  ) {
    const sort = indexChapterFilter.sort || Sort.Desc;
    const sortFilter = sort === Sort.Desc ? { indexSort: -1, name: -1 } : { indexSort: 1, name: 1 };
    const comic = await this.comicRepository.findById(comicId);
    if (!comic) {
      throw new BadRequestException('Comic not found');
    }
    const count = await this.chapterRepository.count({ comicId });
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);
    const chapters = await this.chapterRepository.find(
      { comicId },
      {
        projection: {
          name: 1,
          id: 1,
          views: 1,
          publishDate: 1,
          comicId: 1,
          source: 1,
          indexSort: 1,
        },
        sort: sortFilter,
        skip: pagination.startIndex,
        limit: pagination.perPage,
      },
    );

    return {
      items: chapters,
      headers: responseHeaders,
    };
  }

  async indexByGenre(
    genreId: string,
    filters: IndexComicByGenreFilters,
    pagination: IPagination,
    isHideCopyrightContent: boolean,
  ) {
    const filter: Record<string, any> = {
      genreIds: genreId,
      ...(isHideCopyrightContent && { isCopyrightedComic: false }),
      status: { $ne: ComicStatus.DELETED },
    };

    const count = await this.comicRepository.count(filter);
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);
    const comics = await this.comicRepository.find(filter, {
      skip: pagination.startIndex,
      limit: pagination.perPage,
      sort: { publishDate: -1 },
    });

    return {
      items: comics,
      headers: responseHeaders,
    };
  }

  async home(isHideCopyrightContent: boolean) {
    const featureConditions = isHideCopyrightContent
      ? { isCopyrightedComic: false, status: { $ne: ComicStatus.DELETED } }
      : {
          urlSource: {
            $in: featureHardCoded,
          },
          status: { $ne: ComicStatus.DELETED },
        };

    const [newComic, feature, trending] = await Promise.all([
      this.comicRepository.find(
        {
          ...(isHideCopyrightContent && { isCopyrightedComic: false }),
          status: { $ne: ComicStatus.DELETED },
        },
        { sort: { lastChapterDate: -1 }, limit: HomeListingAmount.new },
      ),
      this.comicRepository.find(featureConditions, { sort: '-createdAt' }),
      this.comicRepository.aggregate([
        {
          $match: {
            ...(isHideCopyrightContent && { isCopyrightedComic: false }),
            status: { $ne: ComicStatus.DELETED },
          },
        },
        { $sample: { size: HomeListingAmount.trending } },
        { $project: { _id: 1 } },
      ]),
    ]);

    return {
      new: newComic,
      feature,
      trending: await Promise.all(trending.map((c) => this.show(c._id))),
    };
  }

  async homeVer2(isHideCopyrightContent: boolean) {
    const featureConditions = isHideCopyrightContent
      ? { isCopyrightedComic: false, status: { $ne: ComicStatus.DELETED } }
      : {
          urlSource: {
            $in: featureHardCoded,
          },
          status: { $ne: ComicStatus.DELETED },
        };

    const [feature, trending] = await Promise.all([
      this.comicRepository.find(featureConditions, { sort: '-createdAt' }),
      this.comicRepository.aggregate([
        {
          $match: {
            ...(isHideCopyrightContent && { isCopyrightedComic: false }),
            status: { $ne: ComicStatus.DELETED },
          },
        },
        { $sample: { size: HomeListingAmount.trending } },
        { $project: { _id: 1 } },
      ]),
    ]);

    return {
      feature,
      trending: await Promise.all(trending.map((c) => this.show(c._id))),
    };
  }

  async trending(filters: TrendingComicFilter, pagination: IPagination, isHideCopyrightContent) {
    const count = await this.comicRepository.count({
      ...(isHideCopyrightContent && { isCopyrightedComic: false }),
      status: { $ne: ComicStatus.DELETED },
    });
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);

    if (isHideCopyrightContent) {
      const noCopyrightedComics = await this.comicRepository.find({
        isCopyrightedComic: false,
        status: { $ne: ComicStatus.DELETED },
      });

      return {
        items: noCopyrightedComics,
        headers: responseHeaders,
      };
    }

    const comicIds = await this.comicRepository.aggregate([
      { $sample: { size: HomeListingAmount.trending } },
      { $project: { _id: 1 } },
    ]);

    return {
      items: await Promise.all(comicIds.map((c) => this.show(c._id))),
      headers: responseHeaders,
    };
  }

  async new(filters: NewComicFilter, pagination: IPagination, isHideCopyrightContent: boolean) {
    const count = await this.comicRepository.count({
      ...(isHideCopyrightContent && { isCopyrightedComic: false }),
      status: { $ne: ComicStatus.DELETED },
    });
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);
    const comics = await this.comicRepository.find(
      {
        ...(isHideCopyrightContent && { isCopyrightedComic: false }),
        status: { $ne: ComicStatus.DELETED },
      },
      {
        skip: pagination.startIndex,
        limit: pagination.perPage,
        sort: { lastChapterDate: -1 },
      },
    );

    return {
      items: comics,
      headers: responseHeaders,
    };
  }

  async newVer2(filters: NewComicFilter, pagination: IPagination, isHideCopyrightContent: boolean) {
    const count = await this.comicRepository.count({
      ...(isHideCopyrightContent && { isCopyrightedComic: false }),
      status: { $ne: ComicStatus.DELETED },
    });
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);
    const comics = await this.comicRepository.find(
      {
        ...(isHideCopyrightContent && { isCopyrightedComic: false }),
        status: { $ne: ComicStatus.DELETED },
      },
      {
        skip: pagination.startIndex,
        limit: pagination.perPage,
        sort: { publishDate: -1 },
      },
    );

    return {
      items: comics,
      headers: responseHeaders,
    };
  }

  async recentlyUpdate(
    filters: NewComicFilter,
    pagination: IPagination,
    isHideCopyrightContent: boolean,
  ) {
    const count = await this.comicRepository.count({
      ...(isHideCopyrightContent && { isCopyrightedComic: false }),
      status: { $ne: ComicStatus.DELETED },
    });
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);
    const comics = await this.comicRepository.find(
      {
        ...(isHideCopyrightContent && { isCopyrightedComic: false }),
        status: { $ne: ComicStatus.DELETED },
      },
      {
        skip: pagination.startIndex,
        limit: pagination.perPage,
        sort: { lastChapterDate: -1 },
      },
    );

    return {
      items: comics,
      headers: responseHeaders,
    };
  }

  private async topRating(pagination: IPagination, isHideCopyrightContent: boolean) {
    const count = await this.comicRepository.count({
      ...(isHideCopyrightContent && { isCopyrightedComic: false }),
      status: { $ne: ComicStatus.DELETED },
    });
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);
    const comics = await this.comicRepository.find(
      {
        ...(isHideCopyrightContent && { isCopyrightedComic: false }),
        status: { $ne: ComicStatus.DELETED },
      },
      { sort: { rating: -1, views: -1 }, limit: pagination.perPage, skip: pagination.startIndex },
    );

    return {
      items: comics,
      headers: responseHeaders,
    };
  }

  private async weeklyRanking(pagination: IPagination, isHideCopyrightContent: boolean) {
    const count = await this.comicRepository.count({
      ...(isHideCopyrightContent && { isCopyrightedComic: false }),
      status: { $ne: ComicStatus.DELETED },
    });
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);

    if (isHideCopyrightContent) {
      const noCopyrightedComics = await this.comicRepository.find({
        isCopyrightedComic: false,
        status: { $ne: ComicStatus.DELETED },
      });

      return {
        items: noCopyrightedComics,
        headers: responseHeaders,
      };
    }

    const top = await this.comicRepository.aggregate([
      { $sample: { size: pagination.perPage } },
      { $project: { _id: 1 } },
    ]);
    const comics = await Promise.all(top.map((c) => this.show(c._id)));

    return {
      items: comics,
      headers: responseHeaders,
    };
  }

  private async monthlyRanking(pagination: IPagination, isHideCopyrightContent: boolean) {
    const count = await this.comicRepository.count({
      ...(isHideCopyrightContent && { isCopyrightedComic: false }),
      status: { $ne: ComicStatus.DELETED },
    });
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);

    if (isHideCopyrightContent) {
      const noCopyrightedComics = await this.comicRepository.find({
        isCopyrightedComic: false,
        status: { $ne: ComicStatus.DELETED },
      });

      return {
        items: noCopyrightedComics,
        headers: responseHeaders,
      };
    }

    const top = await this.comicRepository.aggregate([
      { $sample: { size: pagination.perPage } },
      { $project: { _id: 1 } },
    ]);
    const comics = await Promise.all(top.map((c) => this.show(c._id)));

    return {
      items: comics,
      headers: responseHeaders,
    };
  }

  async top(type: TopType, pagination: IPagination, isHideCopyrightContent = false) {
    switch (type) {
      case TopType.Weekly:
        return this.weeklyRanking(pagination, isHideCopyrightContent);
      case TopType.Monthly:
        return this.monthlyRanking(pagination, isHideCopyrightContent);
      case TopType.Rating:
        return this.topRating(pagination, isHideCopyrightContent);
      default:
        return this.weeklyRanking(pagination, isHideCopyrightContent);
    }
  }

  async search(
    searchComicFilters: SearchComicFilters,
    pagination: IPagination,
    isHideCopyrightContent: boolean,
  ) {
    const filter: Record<string, any> = {
      name: { $regex: new RegExp(searchComicFilters.searchValue, 'i') },
      ...(searchComicFilters.genreId && { genreIds: searchComicFilters.genreId }),
      ...(isHideCopyrightContent && { isCopyrightedComic: false }),
      status: { $ne: ComicStatus.DELETED },
    };

    const count = await this.comicRepository.count(filter);
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);
    const comics = await this.comicRepository.find(filter, {
      skip: pagination.startIndex,
      limit: pagination.perPage,
      sort: { publishDate: -1 },
    });

    return {
      items: comics,
      headers: responseHeaders,
    };
  }

  async cmsIndex(
    searchComicFilters: CmsIndexComicFilters,
    pagination: IPagination,
    isHideCopyrightContent: boolean,
  ) {
    const filter: Record<string, any> = {
      name: { $regex: new RegExp(searchComicFilters.searchValue, 'i') },
      ...(searchComicFilters.genreId && { genreIds: searchComicFilters.genreId }),
      ...(isHideCopyrightContent && { isCopyrightedComic: false }),
    };

    const count = await this.comicRepository.count(filter);
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);
    const comics = await this.comicRepository.find(filter, {
      skip: pagination.startIndex,
      limit: pagination.perPage,
      sort: { publishDate: -1 },
    });

    return {
      items: comics,
      headers: responseHeaders,
    };
  }
}
