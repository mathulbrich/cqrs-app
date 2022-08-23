import { CommandBus, ICommand } from "@nestjs/cqrs";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { Injectable } from "@app/lib/nest/injectable";
import { Newable } from "@app/lib/newable";

interface ResolverOptions<T extends ICommand> {
  command: T;
  resolves: Array<Newable<unknown>>;
}

@Injectable()
export class QueueResolver {
  constructor(
    private readonly subscriber: EventEmitter2,
    private readonly commandExecutor: CommandBus,
  ) {}

  async resolve<T extends ICommand>({ command, resolves }: ResolverOptions<T>): Promise<void> {
    let resolved = false;
    const callback = () => {
      resolved = true;
    };

    for (const event of resolves) {
      this.subscriber.addListener(event.name, callback);
    }

    await this.commandExecutor.execute(command).finally(() => {
      for (const event of resolves) {
        this.subscriber.removeListener(event.name, callback);
      }
    });

    if (!resolved) {
      throw new Error("No expected events were published");
    }
  }
}
