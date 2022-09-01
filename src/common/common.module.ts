import { Module, Global, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";

import { EventEmitterPublisher } from "@app/common/application/event-emitter-publisher";
import { S3StorageReader } from "@app/common/application/s3-storage-reader";
import { S3StorageWriter } from "@app/common/application/s3-storage-writer";
import { AppConfigService } from "@app/common/config/app-config-service";
import { OptionalEnv, validateConfig } from "@app/common/config/config-envs";
import { EventPublisher } from "@app/common/domain/event-publisher";
import { EventSubscriber } from "@app/common/domain/event-subscriber";
import { StorageReader } from "@app/common/domain/storage-reader";
import { StorageWriter } from "@app/common/domain/storage-writer";
import { LoggingMiddleware } from "@app/common/middleware/logging.middleware";
import { IGNORED_ROUTES } from "@app/constants";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`env/${process.env[OptionalEnv.NODE_ENV]}.env`, ".env"],
      expandVariables: true,
      isGlobal: true,
      validate: validateConfig,
    }),
    EventEmitterModule.forRoot(),
  ],
  providers: [
    AppConfigService,
    {
      provide: EventPublisher,
      useClass: EventEmitterPublisher,
    },
    {
      provide: EventSubscriber,
      useClass: EventEmitterPublisher,
    },
    {
      provide: StorageReader,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => new S3StorageReader(config.s3),
    },
    {
      provide: StorageWriter,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => new S3StorageWriter(config.s3),
    },
  ],
  exports: [AppConfigService, EventPublisher, EventSubscriber, StorageReader, StorageWriter],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .exclude(...IGNORED_ROUTES)
      .forRoutes("*");
  }
}
