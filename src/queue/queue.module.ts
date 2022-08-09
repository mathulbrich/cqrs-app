import { Global, Module } from "@nestjs/common";

import { Enqueuer } from "@app/queue/application/enqueuer";
import { GcloudTasksQueueController } from "@app/queue/application/gcloud-tasks-queue.controller";
import { SQSEnqueuer } from "@app/queue/application/sqs-enqueuer";
import { SQSQueueListener } from "@app/queue/application/sqs-queue-listener";
import { SQSQueueUrlBuilder } from "@app/queue/application/sqs-queue-url-builder";

@Global()
@Module({
  exports: [Enqueuer],
  controllers: [GcloudTasksQueueController],
  providers: [
    SQSQueueListener,
    SQSQueueUrlBuilder,
    {
      provide: Enqueuer,
      useClass: SQSEnqueuer,
    },
  ],
})
export class QueueModule {}
