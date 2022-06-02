import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class SendTestNotificationDto {
  @IsNotEmpty()
  @ApiModelProperty({ type: String })
  fcmToken: string;

  @IsNotEmpty()
  @IsMongoId()
  @ApiModelProperty({ type: String })
  comicId: string;

  @IsNotEmpty()
  @ApiModelProperty({ type: String })
  title: string;

  @IsNotEmpty()
  @ApiModelProperty({ type: String })
  body: string;
}

export class SendTestNotificationQueueDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiModelProperty({ type: String })
  comicId: string;
}
