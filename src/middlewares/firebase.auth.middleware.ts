import { Injectable, NestMiddleware, RequestMethod, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { getConfig } from '../modules/common/config.provider';
import { RouteInfo } from '@nestjs/common/interfaces';
import { RequiredAuthRoutes } from '../shared/constants';
import { FirebaseAuthenticationService } from '@aginix/nestjs-firebase-admin';
const baseUrl = getConfig().get('service.baseUrl');

@Injectable()
export class FireBaseAuthMiddleware implements NestMiddleware {
  constructor(private readonly firebaseAuth: FirebaseAuthenticationService) {}

  // eslint-disable-next-line @typescript-eslint/ban-types
  async use(req: Request, res: Response, next: Function) {
    const isRequireRoute = RequiredAuthRoutes.some((excludedRoute: RouteInfo) => {
      return (
        req.originalUrl.includes(`${baseUrl}${excludedRoute.path}`) &&
        (excludedRoute.method === RequestMethod[req.method as string] ||
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          req.method === RequestMethod.ALL)
      );
    });

    if (!isRequireRoute) {
      return next();
    }

    const token = req.headers['access-token'] as string;
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      await this.firebaseAuth.verifyIdToken(token);
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
    next();
  }
}
