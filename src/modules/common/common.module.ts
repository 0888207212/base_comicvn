import { Module, Global } from '@nestjs/common';
import { configProviders } from './config.provider';
import { PaginationHeaderHelper } from '../../adapters/pagination/pagination.helper';

@Global()
@Module({
  imports: [],
  providers: [...configProviders, PaginationHeaderHelper],
  exports: [...configProviders, PaginationHeaderHelper],
})
export class CommonModule {}
