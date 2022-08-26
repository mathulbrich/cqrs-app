import { Global, Module } from "@nestjs/common";

import { Enqueuer } from "@app/queue/application/enqueuer";
import { QueueResolver } from "@app/queue/application/queue-resolver";
import { SQSEnqueuer } from "@app/queue/application/sqs-enqueuer";
import { SQSListener } from "@app/queue/application/sqs-listener";
import { SQSQueueUrlBuilder } from "@app/queue/application/sqs-queue-url-builder";

@Global()
@Module({
  exports: [Enqueuer, QueueResolver],
  controllers: [],
  providers: [
    QueueResolver,
    SQSListener,
    SQSQueueUrlBuilder,
    {
      provide: Enqueuer,
      useClass: SQSEnqueuer,
    },
  ],
})
export class QueueModule {}
