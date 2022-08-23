import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { CqrsModule } from "@nestjs/cqrs";
import { EventEmitterModule } from "@nestjs/event-emitter";

import { EventEmitterPublisher } from "@app/common/application/event-emitter-publisher";
import { EventPublisher } from "@app/common/domain/event-publisher";
import { LoggingModuleConfig } from "@app/common/logging/logging";
import { LoggingInterceptor } from "@app/common/logging/logging.interceptor";
import { AppConfigService } from "@app/config/app-config-service";
import { OptionalEnv, validateConfig } from "@app/config/config-envs";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`env/${process.env[OptionalEnv.NODE_ENV]}.env`],
      expandVariables: true,
      isGlobal: true,
      validate: validateConfig,
    }),
    EventEmitterModule.forRoot(),
    LoggingModuleConfig,
    CqrsModule,
  ],
  providers: [
    AppConfigService,
    {
      provide: EventPublisher,
      useClass: EventEmitterPublisher,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [AppConfigService, EventPublisher],
})
export class CommonModule {}
