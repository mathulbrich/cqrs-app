import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateExampleCommand } from '@app/example/domain/commands/create-example.command';
import { ExampleRepository } from '@app/example/domain/repositories/example.repository';
import { Example } from '@app/example/domain/example';
import { ExampleCreatedEvent } from '@app/example/domain/events/example-created.event';
import { EventPublisher } from '@app/common/domain/event-publisher';

@CommandHandler(CreateExampleCommand)
export class CreateExampleCommandHandler
  implements ICommandHandler<CreateExampleCommand>
{
  public constructor(
    private readonly repository: ExampleRepository,
    private readonly publisher: EventPublisher,
  ) {}

  public async execute(command: CreateExampleCommand): Promise<void> {
    const example = new Example(command);
    await this.repository.store(example);
    await this.publisher.publish(new ExampleCreatedEvent(example));
  }
}
