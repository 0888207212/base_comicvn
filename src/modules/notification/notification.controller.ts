import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { SendTestNotificationDto, SendTestNotificationQueueDto } from './notification.dto';
import { CrawlService } from '../crawl/crawl.service';

@Controller('notifications')
@ApiTags('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly crawlService: CrawlService,
  ) {}

  @ApiOperation({
    operationId: 'sendNotification',
    description: 'sendNotification',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Post('sendNotification')
  sendNotification(@Body() notificationInput: SendTestNotificationDto) {
    return this.notificationService.sendTestNotification(notificationInput);
  }

  @ApiOperation({
    operationId: 'sendNotificationQueue',
    description: 'sendNotificationQueue',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Post('sendNotificationQueue')
  sendNotificationQueue(@Body() notificationInput: SendTestNotificationQueueDto) {
    return this.crawlService.sendTestNotificationQueue(notificationInput);
  }
}
