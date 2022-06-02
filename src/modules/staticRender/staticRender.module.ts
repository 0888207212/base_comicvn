import { Module } from '@nestjs/common';
import { StaticRenderController } from './staticRender.controller';

@Module({
  imports: [],
  controllers: [StaticRenderController],
  providers: [],
  exports: [],
})
export class StaticRenderModule {}
