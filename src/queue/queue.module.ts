import { Global, Module } from '@nestjs/common';
import { Enqueuer } from '@app/queue/enqueuer';
import { QueueController } from '@app/queue/queue.controller';

@Global()
@Module({
  exports: [Enqueuer],
  controllers: [QueueController],
  providers: [Enqueuer],
})
export class QueueModule {}
