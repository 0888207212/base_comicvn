import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestPlatformEnum } from '../modules/user/user.constant';

export const RequestPlatform = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const platform = request.headers['mobile-platform'] as RequestPlatformEnum;
  if (!platform) {
    return RequestPlatformEnum.SwaggerApi;
  }
  return platform;
});
