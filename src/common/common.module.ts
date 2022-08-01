import { Module, Global } from '@nestjs/common';
import { validateConfig } from '@app/config/config-envs';
import { MoongoseModuleConfig } from '@app/common/infrastructure/mongoose';
import { EventBusPublisher } from '@app/common//infrastructure/event-bus-publisher';
import { EventPublisher } from '@app/common/domain/event-publisher';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from '@app/common/infrastructure/config/app-config-service';

@Global()
@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      validate: validateConfig,
    }),
    MoongoseModuleConfig,
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
