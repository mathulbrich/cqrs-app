import { CommandBus } from "@nestjs/cqrs";

import { CreateExampleQueuePayload } from "@app/example/application/queues/create-example-queue.payload";
import { CreateExampleCommand } from "@app/example/domain/commands/create-example.command";
import { Injectable } from "@app/lib/nest/injectable";
import { Uuid } from "@app/lib/uuid";

@Injectable()
export class CreateExampleQueueHandler {
  constructor(private readonly commandExecutor: CommandBus) {}

  async execute(data: unknown): Promise<void> {
    const { description, id, name } = CreateExampleQueuePayload.parse(data);
    await this.commandExecutor.execute(
      new CreateExampleCommand({
        description,
        id: new Uuid(id),
        name,
      }),
    );
  }
}
