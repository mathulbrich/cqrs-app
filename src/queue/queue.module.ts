import { Global, Module } from "@nestjs/common";

import { Enqueuer } from "@app/queue/application/enqueuer";
import { QueueResolver } from "@app/queue/application/queue-resolver";
import { SQSEnqueuer } from "@app/queue/application/sqs-enqueuer";
import { SQSQueueUtil } from "@app/queue/application/sqs-queue-util";
import { SQSLambda } from "@app/queue/lambda/sqs-lambda";
import { SQSListener } from "@app/queue/managed/sqs-listener";

@Global()
@Module({
  exports: [Enqueuer, QueueResolver],
  controllers: [],
  providers: [
    QueueResolver,
    SQSLambda,
    SQSListener,
    SQSQueueUtil,
    {
      provide: Enqueuer,
      useClass: SQSEnqueuer,
    },
  ],
})
export class QueueModule {}
