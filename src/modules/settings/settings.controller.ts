import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrUpdateSettingDto } from './settings.dto';
import { SettingTopic } from './settings.constant';

@Controller('settings')
@ApiTags('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({
    operationId: 'createOrUpdateSetting',
    description: 'createOrUpdateSetting',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Post()
  createOrUpdateSetting(@Body() settingInput: CreateOrUpdateSettingDto) {
    return this.settingsService.createOrUpdate(settingInput);
  }

  @ApiOperation({
    operationId: 'readSetting',
    description: 'readSetting',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Get(':topic')
  readSetting(@Param('topic') topic: SettingTopic) {
    return this.settingsService.readByTopic(topic);
  }
}
