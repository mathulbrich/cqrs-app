import { Module } from "@nestjs/common";

import { AppConfigService } from "@app/common/config/app-config-service";
import { CreateExampleController } from "@app/example/application/controllers/create-example.controller";
import { GetExampleController } from "@app/example/application/controllers/get-example.controller";
import { LogExampleCreatedEventHandler } from "@app/example/application/events/log-example-created-event.handler";
import { CreateExampleQueueHandler } from "@app/example/application/queues/create-example-queue.handler";
import { DynamoDBExampleRepository } from "@app/example/application/repositories/dynamodb-example.repository";
import { InMemoryExampleRepository } from "@app/example/application/repositories/in-memory-example.repository";
import { CreateExampleCommandHandler } from "@app/example/domain/commands/handlers/create-example-command.handler";
import { ExampleRepository } from "@app/example/domain/repositories/example.repository";

@Module({
  exports: [CreateExampleQueueHandler],
  controllers: [CreateExampleController, GetExampleController],
  providers: [
    LogExampleCreatedEventHandler,
    CreateExampleCommandHandler,
    CreateExampleQueueHandler,
    {
      provide: ExampleRepository,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) =>
        configService.app.useInMemoryRepository
          ? new InMemoryExampleRepository()
          : new DynamoDBExampleRepository(configService.dynamoDb),
    },
  ],
})
export class ExampleModule {}
