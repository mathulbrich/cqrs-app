import { Scope } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { EventPublisher, Event } from "@app/common/domain/event-publisher";
import { Injectable } from "@app/lib/nest/injectable";

@Injectable({ scope: Scope.DEFAULT })
export class EventEmitterPublisher implements EventPublisher {
  constructor(private readonly emitter: EventEmitter2) {}

  async publish<T extends Event>(event: T): Promise<void> {
    await this.emitter.emitAsync(event.constructor.name, event);
  }
}
