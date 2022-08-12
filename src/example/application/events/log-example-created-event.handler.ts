import { EventsHandler, IEventHandler } from "@nestjs/cqrs";

import { Logger } from "@app/common/logging/logger";
import { ExampleCreatedEvent } from "@app/example/domain/events/example-created.event";

@EventsHandler(ExampleCreatedEvent)
export class LogExampleCreatedEventHandler implements IEventHandler<ExampleCreatedEvent> {
  private readonly logger = new Logger(LogExampleCreatedEventHandler.name);

  async handle(event: ExampleCreatedEvent): Promise<void> {
    this.logger.info("Example created", event);
  }
}
