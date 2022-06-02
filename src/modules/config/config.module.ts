import { Global, Module } from '@nestjs/common';

import { configProvider } from './config.provider';

@Global()
@Module({
  providers: [configProvider],
  exports: [configProvider],
})
export class ConfigModule {}
