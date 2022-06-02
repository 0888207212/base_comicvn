import { SettingTopic } from './settings.constant';
import { IsEnum, IsNotEmpty, IsNotEmptyObject, IsObject } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { getEnumValues } from '@nestjs/swagger/dist/utils/enum.utils';

export class CreateOrUpdateSettingDto {
  @IsNotEmpty()
  @IsEnum(SettingTopic)
  @ApiModelProperty({
    type: 'enum',
    enum: getEnumValues(SettingTopic),
  })
  topic: SettingTopic;

  @IsNotEmptyObject()
  @IsObject()
  @ApiModelProperty({ type: Object })
  settings: Record<any, any>;
}
