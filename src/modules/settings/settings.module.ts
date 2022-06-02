import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingSchema } from './settings.schema';
import { SettingRepository } from './settings.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'setting', schema: SettingSchema }])],
  controllers: [SettingsController],
  providers: [SettingsService, SettingRepository],
})
export class SettingsModule {}
