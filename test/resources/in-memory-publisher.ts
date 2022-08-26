import { EventPublisher } from "@app/common/domain/event-publisher";
import { EventSubscriber, SubscriptionCallback } from "@app/common/domain/event-subscriber";
import { Newable } from "@app/lib/newable";
import { Option } from "@app/lib/optional";

export class InMemoryPublisher implements EventPublisher, EventSubscriber {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly listeners = new Map<string, Array<SubscriptionCallback<any>>>();
  private readonly publishedEvents: Array<object> = [];

  async publish<T extends object>(event: T): Promise<void> {
    this.publishedEvents.push(event);
    await Promise.all(
      Option(this.listeners.get(event.constructor.name))
        .orElse([])
        .map((listener) => listener(event)),
    );
  }

  subscribe<T extends object>(event: Newable<T>, callback: SubscriptionCallback<T>): void {
    const listeners = Option(this.listeners.get(event.name)).orElse([]).concat(callback);

    this.listeners.set(event.name, listeners);
  }

  unsubscribe<T extends object>(event: Newable<T>, callback: SubscriptionCallback<T>): void {
    const listeners = Option(this.listeners.get(event.name))
      .orElse([])
      .filter((listener) => listener !== callback);

    this.listeners.set(event.name, listeners);
  }

  ofType<T extends object>(eventType: Newable<T>): T[] {
    return this.publishedEvents.filter((e) => e.constructor === eventType) as T[];
  }

  ofTypes(...eventTypes: Newable<object>[]): unknown[] {
    return eventTypes.flatMap((eventType) => this.ofType(eventType));
  }

  singleOfType<T extends object>(eventType: Newable<T>): T {
    const items = this.ofType(eventType);

    if (items.length !== 1) {
      throw new Error(
        `Expected a single event of type ${eventType.name} to have been published, but got ${items.length}`,
      );
    }

    return items[0];
  }

  totalOfListenersFor(event: Newable<object>): number {
    return this.listeners.get(event.name)?.length ?? 0;
  }
}
