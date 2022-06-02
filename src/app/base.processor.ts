import { OnQueueActive, OnQueueCompleted, OnQueueError, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { PinoLogger } from 'nestjs-pino';

export class BaseProcessor {
  protected readonly logger: PinoLogger;

  constructor(logger: PinoLogger) {
    this.logger = logger;
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.info(
      `Processing job ${job.id} of type ${job.name} with data  ${JSON.stringify(job.data)}...`,
    );
  }

  @OnQueueError()
  onError(job: Job) {
    this.logger.info(
      `Error job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job) {
    this.logger.info(
      `Failed job ${job.id} of type ${job.name} with data  ${JSON.stringify(job.data)}...`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    this.logger.info(
      `Complete job ${job.id} of type ${job.name} with data  ${JSON.stringify(job.data)}...`,
    );
  }
}
