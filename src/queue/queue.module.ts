import { Global, Module } from "@nestjs/common";

import { Enqueuer } from "@app/queue/application/enqueuer";
import { SQSLambda } from "@app/queue/application/lambda/sqs-lambda";
import { QueueResolver } from "@app/queue/application/queue-resolver";
import { SQSEnqueuer } from "@app/queue/application/sqs-enqueuer";
import { SQSListener } from "@app/queue/application/sqs-listener";
import { SQSQueueUtil } from "@app/queue/application/sqs-queue-util";

@Global()
@Module({
  exports: [Enqueuer, QueueResolver],
  controllers: [],
  providers: [
    QueueResolver,
    SQSListener,
    SQSLambda,
    SQSQueueUtil,
    {
      provide: Enqueuer,
      useClass: SQSEnqueuer,
    },
  ],
})
export class QueueModule {}
