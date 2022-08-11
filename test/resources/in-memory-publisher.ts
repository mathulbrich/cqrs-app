import { EventPublisher, Event } from "@app/common/domain/event-publisher";
import { Newable } from "@app/lib/newable";

export class InMemoryPublisher implements EventPublisher {
  private readonly publishedEvents: Array<Event> = [];

  async publish<T extends Event>(event: T): Promise<void> {
    this.publishedEvents.push(event);
  }

  ofType<T>(eventType: Newable<T>): T[] {
    return this.publishedEvents.filter((e) => e.constructor === eventType) as T[];
  }

  ofTypes(...eventTypes: Newable<unknown>[]): unknown[] {
    return eventTypes.flatMap((eventType) => this.ofType(eventType));
  }

  singleOfType<T>(eventType: Newable<T>): T {
    const items = this.ofType(eventType);

    if (items.length !== 1) {
      throw new Error(
        `Expected a single event of type ${eventType.name} to have been published, but got ${items.length}`,
      );
    }

    return items[0];
  }
}
