import { faker } from "@faker-js/faker";

import { CreateExampleQueuePayload } from "@app/example/application/queues/create-example-queue.payload";
import { Uuid } from "@app/lib/uuid";

describe("CreateExampleQueuePayload", () => {
  it("Should validate and parse payload", () => {
    // Setup
    const payload: CreateExampleQueuePayload = {
      id: Uuid.generate().toString(),
      name: faker.lorem.word(),
      description: faker.lorem.words(),
    };

    // Exercise
    const parse = CreateExampleQueuePayload.safeParse(payload);

    // Verify
    expect(parse.success).toBeTruthy();
  });

  it("Should fail to parse non uuid id", () => {
    // Setup
    const payload: CreateExampleQueuePayload = {
      id: faker.lorem.word(),
      name: faker.lorem.word(),
      description: faker.lorem.words(),
    };

    // Exercise
    const parse = CreateExampleQueuePayload.safeParse(payload);

    // Verify
    expect(parse.success).toBeFalsy();
  });

  it("Should fail to parse empty name", () => {
    // Setup
    const payload: CreateExampleQueuePayload = {
      id: Uuid.generate().toString(),
      name: "",
      description: faker.lorem.words(),
    };

    // Exercise
    const parse = CreateExampleQueuePayload.safeParse(payload);

    // Verify
    expect(parse.success).toBeFalsy();
  });

  it("Should fail to parse empty description", () => {
    // Setup
    const payload: CreateExampleQueuePayload = {
      id: Uuid.generate().toString(),
      name: faker.lorem.word(),
      description: "",
    };

    // Exercise
    const parse = CreateExampleQueuePayload.safeParse(payload);

    // Verify
    expect(parse.success).toBeFalsy();
  });
});
