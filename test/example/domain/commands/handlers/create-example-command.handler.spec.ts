import { faker } from "@faker-js/faker";
import { omit } from "lodash";

import { CreateExampleCommand } from "@app/example/domain/commands/create-example.command";
import { CreateExampleCommandHandler } from "@app/example/domain/commands/handlers/create-example-command.handler";
import { InMemoryExampleRepository } from "@app/example/infrastructure/repositories/in-memory-example.repository";
import { Uuid } from "@app/lib/uuid";
import { TestEventPublisher } from "@test/resources/test-event-publisher";

class TestArguments {
  public readonly publisher = new TestEventPublisher();
  public readonly repository = new InMemoryExampleRepository();
  public readonly handler = new CreateExampleCommandHandler(
    this.repository,
    this.publisher,
  );
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
    expect(publisher.publishedEvents).toHaveLength(1);
    const example = await repository.findById(command.id);
    expect(example).toBeDefined();
    expect(omit(example.get(), "createdAt")).toStrictEqual({
      description: command.description,
      id: command.id,
      name: command.name,
    });
  });
});
