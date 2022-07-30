import { EventPublisher, Event } from '@app/common/domain/event-publisher';

export class TestEventPublisher implements EventPublisher {
  public readonly publishedEvents: Array<Event> = [];

  public async publish<T extends Event>(event: T): Promise<void> {
    this.publishedEvents.push(event);
  }
}
