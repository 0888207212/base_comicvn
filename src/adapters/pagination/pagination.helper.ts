import { Injectable } from '@nestjs/common';
import * as express from 'express';
import { IPaginationHeader, IPagination } from './pagination.interface';

@Injectable()
export class PaginationHeaderHelper {
  public getHeaders(pagination: IPagination, totalCount: number): IPaginationHeader {
    if (!pagination) {
      return;
    }

    const page = +pagination.page;
    const perPage = +pagination.perPage;
    const pagesCount = Math.ceil(totalCount / perPage);

    return {
      'x-page': page,
      'x-total-count': totalCount,
      'x-pages-count': pagesCount,
      'x-per-page': perPage,
      'x-next-page': page === pagesCount ? page : page + 1,
    };
  }
}

export const createPagination = (page: number, perPage: number): IPagination => {
  page = +page || 1;
  perPage = +perPage || 20;

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;

  return {
    page,
    perPage,
    startIndex,
    endIndex,
  };
};

export function setPaginationResponseHeader(res: express.Response, pagedObjects: any): any {
  for (const key in pagedObjects.headers) {
    if (pagedObjects.headers.hasOwnProperty(key)) {
      res.append(key, pagedObjects.headers[key]);
    }
  }
  return res.json(pagedObjects.items);
}
