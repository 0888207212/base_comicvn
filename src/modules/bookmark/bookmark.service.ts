import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { BookmarkRepository } from './bookmark.repository';
import { ComicService } from '../comic/comic.service';
import { CreateBookMarkDto, DeleteBookMarkDto, IndexBookmarkFilters } from './bookmark.dto';
import { IBookMark } from './bookmark.interface';
import { ComicRepository } from '../comic/comic.repository';
import { now } from 'mongoose';
import { PaginationHeaderHelper } from '../../adapters/pagination/pagination.helper';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { FirebaseMessagingService } from '@aginix/nestjs-firebase-admin';

@Injectable()
export class BookmarkService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bookmarkRepository: BookmarkRepository,
    private readonly comicRepository: ComicRepository,
    private readonly comicService: ComicService,
    private readonly firebaseMessagingService: FirebaseMessagingService,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async index(userId: string, indexBookmarkFilter: IndexBookmarkFilters, pagination: IPagination) {
    const filter: Record<string, string> = {
      userId,
    };

    const count = await this.bookmarkRepository.count(filter);
    const responseHeaders = this.paginationHeaderHelper.getHeaders(pagination, count);
    const comicIds = await this.bookmarkRepository.find(filter, {
      skip: pagination.startIndex,
      limit: pagination.perPage,
      sort: '-createdAt',
      projection: { comicId: 1 },
    });

    return {
      items: await this.comicRepository.find({ _id: { $in: comicIds.map((b) => b.comicId) } }),
      headers: responseHeaders,
    };
  }

  async delete(userId: string, deleteBookmarkInput: DeleteBookMarkDto): Promise<IBookMark> {
    const user = await this.userRepository.findOne({ userId });

    if (!user) {
      throw new BadRequestException(`userId = ${userId} is not found`);
    }

    const isBookmarked = await this.bookmarkRepository.exists({
      userId,
      comicId: deleteBookmarkInput.comicId,
    });

    if (!isBookmarked) {
      throw new BadRequestException(
        `Bookmark at comicId = ${deleteBookmarkInput.comicId} not found`,
      );
    }

    if (user.fcmTokens.length !== 0) {
      await this.firebaseMessagingService.unsubscribeFromTopic(
        user.fcmTokens,
        deleteBookmarkInput.comicId,
      );
    }

    return this.bookmarkRepository.deleteOne({ userId, comicId: deleteBookmarkInput.comicId });
  }

  async create(userId: string, createBookmarkInput: CreateBookMarkDto): Promise<IBookMark> {
    const user = await this.userRepository.findOne({ userId });

    if (!user) {
      throw new BadRequestException(`userId = ${userId} is not found`);
    }

    const comic = await this.comicRepository.existsById(createBookmarkInput.comicId);
    if (!comic) {
      throw new BadRequestException(`${createBookmarkInput.comicId} is not found`);
    }

    const isBookmarked = await this.bookmarkRepository.exists({
      userId,
      comicId: createBookmarkInput.comicId,
    });

    if (isBookmarked) {
      throw new BadRequestException(`${createBookmarkInput.comicId} is already bookmarked`);
    }

    if (user.fcmTokens.length !== 0) {
      this.firebaseMessagingService.subscribeToTopic(user.fcmTokens, createBookmarkInput.comicId);
    }

    return this.bookmarkRepository.create({
      comicId: createBookmarkInput.comicId,
      userId,
      bookmarkedAt: now(),
    });
  }
}
