import { Scope } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";

import { EventPublisher, Event } from "@app/common/domain/event-publisher";
import { Injectable } from "@app/lib/nest/injectable";

@Injectable({ scope: Scope.DEFAULT })
export class EventBusPublisher implements EventPublisher {
  constructor(private readonly eventBus: EventBus) {}

  publish<T extends Event>(event: T): Promise<void> {
    return this.eventBus.publish(event);
  }
}
