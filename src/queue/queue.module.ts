import { Global, Module } from "@nestjs/common";

import { Enqueuer } from "@app/queue/application/enqueuer";
import { GcloudTasksEnqueuer } from "@app/queue/application/gcloud-tasks-enqueuer";
import { GcloudTasksQueueController } from "@app/queue/application/gcloud-tasks-queue.controller";

@Global()
@Module({
  exports: [Enqueuer],
  controllers: [GcloudTasksQueueController],
  providers: [
    {
      provide: Enqueuer,
      useClass: GcloudTasksEnqueuer,
    },
  ],
})
export class QueueModule {}
