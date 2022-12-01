import { faker } from "@faker-js/faker";

import { DynamoDBExampleRepository } from "@app/example/application/repositories/dynamodb-example-repository";
import { Example } from "@app/example/domain/example";
import { Uuid } from "@app/lib/uuid";
import { runWithDynamoDB } from "@test/integration/setup/dynamodb";
import { INTEGRATION_DEFAULT_TIMEOUT } from "@test/integration/setup/test-setup";
import { ExampleFixture } from "@test/resources/fixtures/example-fixture";

const sortFn = (a: Example, b: Example) => a.id.toString().localeCompare(b.id.toString());

describe(DynamoDBExampleRepository.name, () => {
  jest.setTimeout(INTEGRATION_DEFAULT_TIMEOUT);

  describe("#updateDescription", () => {
    it("Should update only description", async () => {
      await runWithDynamoDB(async ({ config }) => {
        const repository = new DynamoDBExampleRepository(config);

        const example = new ExampleFixture().build();
        await repository.store(example);

        const newDescription = faker.random.words();
        await repository.updateDescription(example.id, newDescription);

        const actual = await repository.findById(example.id);
        expect(actual).toBeDefined();
        expect(actual.get().description).toEqual(newDescription);
        expect(actual.get().name).toEqual(example.name);
      });
    });
  });

  describe("#findById", () => {
    it("Should find example by id", async () => {
      await runWithDynamoDB(async ({ config }) => {
        // Setup
        const repository = new DynamoDBExampleRepository(config);
        const example = new ExampleFixture().build();

        // Exercise
        await repository.store(example);

        // Verify
        const result = await repository.findById(example.id);
        expect(result.isDefined()).toBeTruthy();
        expect(result.get()).toEqual(example);
      });
    });

    it("Should return None when example is not found", async () => {
      await runWithDynamoDB(async ({ config }) => {
        // Setup
        const repository = new DynamoDBExampleRepository(config);
        const example = new ExampleFixture().build();
        await repository.store(example);

        // Exercise
        const result = await repository.findById(Uuid.generate());

        // Verify
        expect(result.isDefined()).toBeFalsy();
      });
    });
  });

  describe("#findAll", () => {
    it("Should find all examples", async () => {
      await runWithDynamoDB(async ({ config }) => {
        // Setup
        const repository = new DynamoDBExampleRepository(config);
        const examples = new ExampleFixture().buildMany(3);
        for (const example of examples) {
          // eslint-disable-next-line no-await-in-loop
          await repository.store(example);
        }

        // Exercise
        const result = repository.findAll();
        const resultExamples = new Array<Example>();
        for await (const item of result) {
          resultExamples.push(item);
        }

        // Verify
        expect(resultExamples).toHaveLength(3);
        expect(resultExamples.sort(sortFn)).toEqual(examples.sort(sortFn));
      });
    });
  });
});
