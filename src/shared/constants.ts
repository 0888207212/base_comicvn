import { RouteInfo } from '@nestjs/common/interfaces';
import { HttpStatus, RequestMethod } from '@nestjs/common';
import { AxiosResponse } from 'axios';

export const EXCLUDED_USER_MIDDLEWARE_ROUTES: RouteInfo[] = [
  { path: '/health', method: RequestMethod.GET },
  { path: '/public/images', method: RequestMethod.GET },
  { path: '/auth/login', method: RequestMethod.POST },
  { path: '/auth/register', method: RequestMethod.POST },
];

export const RequiredAuthRoutes: RouteInfo[] = [
  { path: '/me', method: RequestMethod.GET },
  { path: '/auth/logout', method: RequestMethod.POST },
  { path: '/auth/updateInfo', method: RequestMethod.PUT },
  { path: '/bookmarks', method: RequestMethod.POST },
  { path: '/bookmarks', method: RequestMethod.GET },
  { path: '/bookmarks', method: RequestMethod.DELETE },
];

export interface IGeneralErrorShape {
  message: string;
  description?: string;
  statusCode?: HttpStatus;
  stackTrace?: any;
  logData?: any;
  data?: any;
}

export interface FirebaseRefreshResponse extends AxiosResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
