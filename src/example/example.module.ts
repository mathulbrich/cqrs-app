import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";

import { AppConfigService } from "@app/common/infrastructure/config/app-config-service";
import { CreateExampleController } from "@app/example/application/controllers/create-example.controller";
import { GetExampleController } from "@app/example/application/controllers/get-example.controller";
import { LogExampleCreatedEventHandler } from "@app/example/application/events/log-example-created-event.handler";
import { CreateExampleQueueHandler } from "@app/example/application/queues/create-example-queue.handler";
import { CreateExampleCommandHandler } from "@app/example/domain/commands/handlers/create-example-command.handler";
import { ExampleRepository } from "@app/example/domain/repositories/example.repository";
import { InMemoryExampleRepository } from "@app/example/infrastructure/repositories/in-memory-example.repository";
import { MongoDBExampleRepository } from "@app/example/infrastructure/repositories/mongodb-example.repository";

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
      inject: [AppConfigService, getConnectionToken()],
      useFactory: (service: AppConfigService, connection: Connection) =>
        service.app.useInMemoryRepository
          ? new InMemoryExampleRepository()
          : new MongoDBExampleRepository(connection),
    },
  ],
})
export class ExampleModule {}
