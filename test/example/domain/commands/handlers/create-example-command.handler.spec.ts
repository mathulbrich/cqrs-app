import { faker } from "@faker-js/faker";
import { omit } from "lodash";

import { InMemoryExampleRepository } from "@app/example/application/repositories/in-memory-example.repository";
import { CreateExampleCommand } from "@app/example/domain/commands/create-example.command";
import { CreateExampleCommandHandler } from "@app/example/domain/commands/handlers/create-example-command.handler";
import { ExampleCreatedEvent } from "@app/example/domain/events/example-created.event";
import { Uuid } from "@app/lib/uuid";
import { InMemoryPublisher } from "@test/resources/in-memory-publisher";

class TestArguments {
  public readonly publisher = new InMemoryPublisher();
  public readonly repository = new InMemoryExampleRepository();
  public readonly handler = new CreateExampleCommandHandler(this.repository, this.publisher);
}

describe(CreateExampleCommandHandler.name, () => {
  it("Should store example and publish event", async () => {
    // Setup
    const { handler, repository, publisher } = new TestArguments();
    const command = new CreateExampleCommand({
      id: Uuid.generate(),
      name: faker.lorem.word(),
      description: faker.lorem.words(),
    });

    // Execute
    await handler.execute(command);

    // Verify
    const event = publisher.singleOfType(ExampleCreatedEvent);
    expect(event.example.createdAt?.getTime()).toBeLessThanOrEqual(Date.now());
    const example = await repository.findById(command.id);
    expect(example).toBeDefined();
    expect(omit(example.get(), "createdAt")).toStrictEqual({
      description: command.description,
      id: command.id,
      name: command.name,
    });
  });
});
