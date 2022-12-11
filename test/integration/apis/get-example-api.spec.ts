import { faker } from "@faker-js/faker";
import { retry } from "async";
import request from "supertest";

import { OptionalEnv } from "@app/common/config/config-envs";
import { DynamoDBExampleRepository } from "@app/example/application/repositories/dynamodb-example-repository";
import {
  IntegrationTestSetup,
  INTEGRATION_DEFAULT_TIMEOUT,
} from "@test/integration/setup/test-setup";
import { ExampleFixture } from "@test/resources/fixtures/example-fixture";

describe("Get Example API", () => {
  jest.setTimeout(INTEGRATION_DEFAULT_TIMEOUT);

  it("should store then get the example", async () => {
    await new IntegrationTestSetup().run(async ({ app, dynamodb }) => {
      const example = new ExampleFixture().build();
      const repository = new DynamoDBExampleRepository(dynamodb.config);
      await repository.store(example);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/example/${example.id.toString()}`)
        .expect(200);

      expect(response.body).toEqual({
        id: example.id.toString(),
        name: example.name,
        description: example.description,
      });
    });
  });

  it("should get all examples", async () => {
    await new IntegrationTestSetup().run(async ({ app, dynamodb }) => {
      const numberOfExamples = faker.datatype.number({ min: 2, max: 10 });
      const examples = new ExampleFixture().buildMany(numberOfExamples);
      const repository = new DynamoDBExampleRepository(dynamodb.config);
      for (const example of examples) {
        // eslint-disable-next-line no-await-in-loop
        await repository.store(example);
      }

      const response = await request(app.getHttpServer()).get("/api/v1/example").expect(200);

      expect(response.body).toHaveLength(numberOfExamples);
    });
  });

  it("should store and get all examples in memory", async () => {
    const envs = {
      [OptionalEnv.USE_IN_MEMORY_REPOSITORY]: "1",
    };

    await new IntegrationTestSetup({ envs }).run(async ({ app }) => {
      const name = faker.lorem.word();
      const description = faker.lorem.words();
      const createResponse = await request(app.getHttpServer())
        .post("/api/v1/create-example")
        .send({ name, description })
        .expect(201);

      const id = createResponse.headers["example-id"];
      expect(id).toBeDefined();

      await retry({ interval: 100, times: 20 }, async () => {
        const getExampleResponse = await request(app.getHttpServer())
          .get("/api/v1/example")
          .expect(200);

        expect(getExampleResponse.body).toHaveLength(1);
        expect(getExampleResponse.body[0]).toEqual({ id, name, description });
      });
    });
  });

  it("should return 400 when Uuid is invalid", async () => {
    await new IntegrationTestSetup().run(async ({ app }) => {
      const invalidUuid = faker.random.word();
      const response = await request(app.getHttpServer())
        .get(`/api/v1/example/${invalidUuid}`)
        .expect(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          formErrors: ["Invalid uuid"],
        }),
      );
    });
  });
});
