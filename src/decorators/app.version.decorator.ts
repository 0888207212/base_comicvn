import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AppVersion = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const version = request.headers['app-version'];
  if (!version) {
    return 0;
  }
  return version;
});
