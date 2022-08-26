import { EventSubscriber } from "@app/common/domain/event-subscriber";
import { Injectable } from "@app/lib/nest/injectable";
import { Newable } from "@app/lib/newable";

interface ResolverOptions {
  execute: () => Promise<void>;
  resolves: Array<Newable<object>>;
  rejects: Array<Newable<object>>;
}

@Injectable()
export class QueueResolver {
  constructor(private readonly subscriber: EventSubscriber) {}

  async resolve({ execute, resolves, rejects }: ResolverOptions): Promise<void> {
    let resolved = false;
    let rejected = false;
    const resolvedCallback = () => {
      resolved = true;
    };
    const rejectedCallback = () => {
      rejected = true;
    };

    for (const event of resolves) {
      this.subscriber.subscribe(event, resolvedCallback);
    }

    for (const event of rejects) {
      this.subscriber.subscribe(event, rejectedCallback);
    }

    await execute().finally(() => {
      for (const event of resolves) {
        this.subscriber.unsubscribe(event, resolvedCallback);
      }
      for (const event of rejects) {
        this.subscriber.unsubscribe(event, rejectedCallback);
      }
    });

    if (rejected || !resolved) {
      throw new Error("Queue execution resolves or rejects conditions were not met");
    }
  }
}
