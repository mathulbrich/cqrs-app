import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";

import { EventBusPublisher } from "@app/common//infrastructure/event-bus-publisher";
import { EventPublisher } from "@app/common/domain/event-publisher";
import { AppConfigService } from "@app/common/infrastructure/config/app-config-service";
import { MongooseModuleConfig as MongooseModuleConfig } from "@app/common/infrastructure/mongoose";
import { validateConfig } from "@app/config/config-envs";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateConfig,
      expandVariables: true,
    }),
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
