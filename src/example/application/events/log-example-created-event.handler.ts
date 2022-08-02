import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";

import { ExampleCreatedEvent } from "@app/example/domain/events/example-created.event";

@EventsHandler(ExampleCreatedEvent)
export class LogExampleCreatedEventHandler
  implements IEventHandler<ExampleCreatedEvent>
{
  public async handle(event: ExampleCreatedEvent): Promise<void> {
    Logger.debug(`Example created: ${JSON.stringify(event)}`);
  }
}
