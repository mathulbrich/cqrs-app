import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";

import { EventPublisher, Event } from "@app/common/domain/event-publisher";

@Injectable()
export class EventBusPublisher implements EventPublisher {
  constructor(private readonly eventBus: EventBus) {}

  public async publish<T extends Event>(event: T): Promise<void> {
    return this.eventBus.publish(event);
  }
}
