import { Global, Module } from "@nestjs/common";

import { GcloudTasksQueueController } from "@app/queue/application/gcloud-tasks-queue.controller";
import { Enqueuer } from "@app/queue/infrastructure/enqueuer";
import { GcloudTasksEnqueuer } from "@app/queue/infrastructure/gcloud-tasks-enqueuer";

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
