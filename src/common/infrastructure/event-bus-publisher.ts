import { Injectable } from '@nestjs/common';
import { EventPublisher, Event } from '@app/common/domain/event-publisher';
import { EventBus } from '@nestjs/cqrs';

@Injectable()
export class EventBusPublisher implements EventPublisher {
  constructor(private readonly eventBus: EventBus) {}

  public async publish<T extends Event>(event: T): Promise<void> {
    return this.eventBus.publish(event);
  }
}
