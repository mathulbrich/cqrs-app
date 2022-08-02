import { Example } from "@app/example/domain/example";
import { MongoDBExampleRepository } from "@app/example/infrastructure/repositories/mongodb-example.repository";
import { Uuid } from "@app/lib/uuid";
import { runWithMongoConnection } from "@test/integration/setup/mongodb";
import { INTEGRATION_DEFAULT_TIMEOUT } from "@test/integration/setup/test-setup";
import { ExampleFixture } from "@test/resources/fixtures/example-fixture";

describe(MongoDBExampleRepository.name, () => {
  jest.setTimeout(INTEGRATION_DEFAULT_TIMEOUT);

  describe("#findById", () => {
    it("Should find example by id", async () => {
      await runWithMongoConnection(async (connection) => {
        // Setup
        const repository = new MongoDBExampleRepository(connection);
        const example = new ExampleFixture().build();

        // Exercise
        await repository.store(example);

        // Verify
        const result = await repository.findById(example.id);
        expect(result.isDefined()).toBeTruthy();
        expect(result.get()).toStrictEqual(example);
      });
    });

    it("Should return None when example is not found", async () => {
      await runWithMongoConnection(async (connection) => {
        // Setup
        const repository = new MongoDBExampleRepository(connection);
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
      await runWithMongoConnection(async (connection) => {
        // Setup
        const repository = new MongoDBExampleRepository(connection);
        const examples = new ExampleFixture().buildMany(3);
        for (const example of examples) {
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
        expect(resultExamples).toStrictEqual(examples);
      });
    });
  });
});
