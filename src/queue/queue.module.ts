import { Global, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { Enqueuer } from "@app/queue/application/enqueuer";
import { QueueResolver } from "@app/queue/application/queue-resolver";
import { SQSEnqueuer } from "@app/queue/application/sqs-enqueuer";
import { SQSQueueListener } from "@app/queue/application/sqs-queue-listener";
import { SQSQueueUrlBuilder } from "@app/queue/application/sqs-queue-url-builder";

@Global()
@Module({
  imports: [CqrsModule],
  exports: [Enqueuer, QueueResolver],
  controllers: [],
  providers: [
    QueueResolver,
    SQSQueueListener,
    SQSQueueUrlBuilder,
    {
      provide: Enqueuer,
      useClass: SQSEnqueuer,
    },
  ],
})
export class QueueModule {}
