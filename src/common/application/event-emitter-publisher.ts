import { Scope } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { EventPublisher } from "@app/common/domain/event-publisher";
import { EventSubscriber, SubscriptionCallback } from "@app/common/domain/event-subscriber";
import { Logger } from "@app/common/logging/logger";
import { Injectable } from "@app/lib/nest/injectable";
import { Newable } from "@app/lib/newable";

@Injectable({ scope: Scope.DEFAULT })
export class EventEmitterPublisher implements EventPublisher, EventSubscriber {
  private readonly logger = new Logger(EventPublisher.name);

  constructor(private readonly emitter: EventEmitter2) {}

  async publish<T extends object>(event: T): Promise<void> {
    this.logger.debug(`Publishing event ${event.constructor.name}`, event);
    await this.emitter.emitAsync(event.constructor.name, event);
  }

  subscribe<T extends object>(event: Newable<T>, callback: SubscriptionCallback<T>): void {
    this.emitter.addListener(event.name, callback);
  }

  unsubscribe<T extends object>(event: Newable<T>, callback: SubscriptionCallback<T>): void {
    this.emitter.removeListener(event.name, callback);
  }
}
