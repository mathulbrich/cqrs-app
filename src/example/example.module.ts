import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateExampleQueueHandler } from '@app/example/application/queues/create-example-queue.handler';
import { CreateExampleController } from '@app/example/application/controllers/create-example.controller';
import { LogExampleCreatedEventHandler } from '@app/example/application/events/log-example-created-event.handler';
import { CreateExampleCommandHandler } from '@app/example/domain/commands/handlers/create-example-command.handler';
import { ExampleRepository } from '@app/example/domain/repositories/example.repository';
import { InMemoryExampleRepository } from '@app/example/infrastructure/repositories/in-memory-example.repository';
import { GetExampleController } from '@app/example/application/controllers/get-example.controller';

@Module({
  imports: [CqrsModule],
  exports: [CreateExampleQueueHandler],
  controllers: [CreateExampleController, GetExampleController],
  providers: [
    LogExampleCreatedEventHandler,
    CreateExampleCommandHandler,
    CreateExampleQueueHandler,
    {
      provide: ExampleRepository,
      useClass: InMemoryExampleRepository,
    },
  ],
})
export class ExampleModule {}
