import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ExampleCreatedEvent } from '@app/example/domain/events/example-created.event';

@EventsHandler(ExampleCreatedEvent)
export class LogExampleCreatedEventHandler
  implements IEventHandler<ExampleCreatedEvent>
{
  public async handle(event: ExampleCreatedEvent): Promise<void> {
    Logger.debug(`Example created: ${JSON.stringify(event)}`);
  }
}
