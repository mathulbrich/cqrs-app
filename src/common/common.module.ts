import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";

import { EventBusPublisher } from "@app/common//infrastructure/event-bus-publisher";
import { EventPublisher } from "@app/common/domain/event-publisher";
import { AppConfigService } from "@app/common/infrastructure/config/app-config-service";
import { LoggingModuleConfig } from "@app/common/infrastructure/logging/logging";
import { MongooseModuleConfig as MongooseModuleConfig } from "@app/common/infrastructure/mongoose";
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
    MongooseModuleConfig,
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
export class CommonModule {}
