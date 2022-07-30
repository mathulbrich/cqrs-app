import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateExampleCommand } from '@app/example/domain/commands/create-example.command';
import { CreateExampleQueuePayload } from '@app/example/application/queues/create-example-queue.payload';
import { Uuid } from '@app/lib/uuid';

@Injectable()
export class CreateExampleQueueHandler {
  public constructor(private readonly commandExecutor: CommandBus) {}

  public async execute(data: unknown): Promise<void> {
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
