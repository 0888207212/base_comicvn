import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getConfig } from '../modules/common/config.provider';
import { RequestPlatformEnum } from '../modules/user/user.constant';

const config = getConfig();

export const DynamicContent = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const dynamicContentConfig = config.get<Record<string, boolean>>('dynamicContent');
  if (dynamicContentConfig.invisibleAll) {
    return true;
  }

  const request = ctx.switchToHttp().getRequest();
  const requestVersion = request.headers['app-version'] ?? 0;
  const platform =
    (request.headers['mobile-platform'] as RequestPlatformEnum) ?? RequestPlatformEnum.Android;

  if (platform === RequestPlatformEnum.Android) {
    if (dynamicContentConfig.visibleAndroid) {
      return true;
    }

    const apiAndroidVersion = config.get<string>('api.apiAndroidVersion');
    return requestVersion > apiAndroidVersion;
  }
  if (platform === RequestPlatformEnum.Ios) {
    if (dynamicContentConfig.invisibleIos) {
      return true;
    }

    const apiIosVersion = config.get<string>('api.apiIosVersion');
    return requestVersion > apiIosVersion;
  }

  const apiVersion = config.get<string>('api.apiVersion');
  return requestVersion > apiVersion;
});
