import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { CqrsModule } from "@nestjs/cqrs";

import { EventBusPublisher } from "@app/common/application/event-bus-publisher";
import { EventPublisher } from "@app/common/domain/event-publisher";
import { LoggingModuleConfig } from "@app/common/logging/logging";
import { LoggingInterceptor } from "@app/common/logging/logging.interceptor";
import { AppConfigService } from "@app/config/app-config-service";
import { validateConfig } from "@app/config/config-envs";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
      expandVariables: true,
    }),
    LoggingModuleConfig,
    CqrsModule,
  ],
  providers: [
    AppConfigService,
    {
      provide: EventPublisher,
      useClass: EventBusPublisher,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [AppConfigService, EventPublisher],
})
export class CommonModule {}
