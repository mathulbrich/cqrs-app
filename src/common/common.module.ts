import { Module, Global, DynamicModule } from '@nestjs/common';
import { validateConfig } from '@app/config/config-load';
// import { MoongoseModuleConfig } from '@app/common/infrastructure/mongoose';
// import { pushIf } from '@app/lib/array';
import { EventBusPublisher } from '@app/common//infrastructure/event-bus-publisher';
import { EventPublisher } from '@app/common/domain/event-publisher';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from '@app/common/infrastructure/config/app-config-service';
import { MongoDBConfigService } from '@app/common/infrastructure/config/mongodb-config-service';
import { QueueConfigService } from '@app/common/infrastructure/config/queue-config-service';

const loadDynamicModule = (): Array<DynamicModule> => {
  const modules = new Array<DynamicModule>();
  // pushIf(modules, MoongoseModuleConfig, !config.app.useInMemoryRepository);
  return modules;
};

@Global()
@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      validate: validateConfig,
    }),
    ...loadDynamicModule(),
  ],
  providers: [
    AppConfigService,
    MongoDBConfigService,
    QueueConfigService,
    {
      provide: EventPublisher,
      useClass: EventBusPublisher,
    },
  ],
  exports: [
    AppConfigService,
    EventPublisher,
    MongoDBConfigService,
    QueueConfigService,
  ],
})
export class CommonModule {}
