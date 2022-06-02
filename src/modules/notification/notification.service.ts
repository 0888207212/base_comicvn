import { Injectable } from '@nestjs/common';
import { FirebaseMessagingService } from '@aginix/nestjs-firebase-admin';
import { UserRepository } from '../user/user.repository';
import { maxAttempt, NotificationType } from './notification.constant';
import { SendTestNotificationDto } from './notification.dto';
import { ComicRepository } from '../comic/comic.repository';
import { PinoLogger } from 'nestjs-pino';
import { CrawlJob, CrawlQueue } from '../crawl/crawl.constant';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { getRandomInt } from '../../shared/helpers';

@Injectable()
export class NotificationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly comicRepository: ComicRepository,
    private readonly firebaseMessagingService: FirebaseMessagingService,
    @InjectQueue(CrawlQueue.NotificationQueue) private notificationQueue: Queue,
    private readonly logger: PinoLogger,
  ) {}

  async sendTestNotification(notificationInput: SendTestNotificationDto) {
    return this.firebaseMessagingService.sendToDevice(notificationInput.fcmToken, {
      data: { type: NotificationType.Comic, comicId: notificationInput.comicId },
      notification: { title: notificationInput.title, body: notificationInput.body },
    });
  }

  async sendNewChapterNotificationToSubscriber(comicId: string, attempt = 0) {
    if (attempt > maxAttempt) {
      return 0;
    }
    if (attempt > 0) {
      this.logger.info(`Retrying send notification to topic: ${comicId}`);
    }
    try {
      const comic = await this.comicRepository.findById(comicId);
      if (!comic) {
        return 0;
      }
      await this.firebaseMessagingService.sendToTopic(comicId, {
        data: { type: NotificationType.Comic, comicId },
        notification: {
          title: `🌸 ${comic.name} đã có chap mới ❗❗❗`,
          body: `🔥 Cùng đọc ngay nào 👀 👀 👀`,
        },
      });
    } catch (e) {
      this.logger.error(`Send notification failed: ${e.message}`);
      await this.notificationQueue.add(
        CrawlJob.NotifyNewChapter,
        { comicId, attempt: ++attempt },
        { removeOnComplete: true, delay: getRandomInt(10000, 600000) },
      );
    }
  }
}
