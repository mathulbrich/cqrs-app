import { OnEvent } from "@nestjs/event-emitter";

import { Logger } from "@app/common/logging/logger";
import { ExampleCreatedEvent } from "@app/example/domain/events/example-created-event";

export class LogExampleCreatedEventHandler {
  private readonly logger = new Logger(LogExampleCreatedEventHandler.name);

  @OnEvent(ExampleCreatedEvent.name)
  async handle(event: ExampleCreatedEvent): Promise<void> {
    this.logger.info("Example created", event);
  }
}
