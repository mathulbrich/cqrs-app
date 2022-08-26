import { CommandBus } from "@nestjs/cqrs";

import { CreateExampleQueuePayload } from "@app/example/application/queues/create-example-queue.payload";
import { CreateExampleCommand } from "@app/example/domain/commands/create-example.command";
import { ExampleCreatedEvent } from "@app/example/domain/events/example-created.event";
import { Injectable } from "@app/lib/nest/injectable";
import { Uuid } from "@app/lib/uuid";
import { QueueResolver } from "@app/queue/application/queue-resolver";

@Injectable()
export class CreateExampleQueueHandler {
  constructor(
    private readonly commandExecutor: CommandBus,
    private readonly resolver: QueueResolver,
  ) {}

  execute(data: unknown): Promise<void> {
    const { description, id, name } = CreateExampleQueuePayload.parse(data);
    return this.resolver.resolve({
      execute: () =>
        this.commandExecutor.execute(
          new CreateExampleCommand({
            description,
            id: new Uuid(id),
            name,
          }),
        ),
      resolves: [ExampleCreatedEvent],
      rejects: [],
    });
  }
}
