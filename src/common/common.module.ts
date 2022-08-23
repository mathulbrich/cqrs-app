import { Module, Global, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";

import { EventBusPublisher } from "@app/common/application/event-bus-publisher";
import { EventPublisher } from "@app/common/domain/event-publisher";
import { LoggingMiddleware } from "@app/common/middleware/logging.middleware";
import { AppConfigService } from "@app/config/app-config-service";
import { OptionalEnv, validateConfig } from "@app/config/config-envs";
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
    CqrsModule,
  ],
  providers: [
    AppConfigService,
    {
      provide: EventPublisher,
      useClass: EventBusPublisher,
    },
  ],
  exports: [AppConfigService, EventPublisher],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .exclude(...IGNORED_ROUTES)
      .forRoutes("*");
  }
}
