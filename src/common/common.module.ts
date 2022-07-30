import { Module, Global, DynamicModule } from '@nestjs/common';
import { config } from '@app/config/config-load';
import { MoongoseModuleConfig } from '@app/common/infrastructure/mongoose';
import { pushIf } from '@app/lib/array';
import { EventBusPublisher } from '@app/common//infrastructure/event-bus-publisher';
import { EventPublisher } from '@app/common/domain/event-publisher';
import { CqrsModule } from '@nestjs/cqrs';

const loadDynamicModule = (): Array<DynamicModule> => {
  const modules = new Array<DynamicModule>();
  pushIf(modules, MoongoseModuleConfig, !config.app.useInMemoryRepository);
  return modules;
};

@Global()
@Module({
  imports: [CqrsModule, ...loadDynamicModule()],
  providers: [
    {
      provide: EventPublisher,
      useClass: EventBusPublisher,
    },
  ],
  exports: [EventPublisher],
})
export class CommonModule {}
