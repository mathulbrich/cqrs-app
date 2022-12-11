import { faker } from "@faker-js/faker";
import { retry } from "async";
import request from "supertest";

import { DynamoDBExampleRepository } from "@app/example/application/repositories/dynamodb-example-repository";
import { Uuid } from "@app/lib/uuid";
import {
  IntegrationTestSetup,
  INTEGRATION_DEFAULT_TIMEOUT,
} from "@test/integration/setup/test-setup";

describe("Create Example API", () => {
  jest.setTimeout(INTEGRATION_DEFAULT_TIMEOUT);

  it("should create and store the example", async () => {
    await new IntegrationTestSetup().run(async ({ app, dynamodb }) => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/create-example")
        .send({
          name: faker.lorem.word(),
          description: faker.lorem.words(),
        })
        .expect(201);

      const exampleId = response.headers["example-id"];
      expect(exampleId).toBeDefined();

      await retry({ interval: 100, times: 20 }, async () => {
        const repository = new DynamoDBExampleRepository(dynamodb.config);
        const example = await repository.findById(new Uuid(exampleId));
        expect(example.isDefined()).toBeTruthy();
      });
    });
  });

  it("should return 400 when the example is invalid", async () => {
    await new IntegrationTestSetup().run(async ({ app }) => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/create-example")
        .send(faker.datatype.json())
        .expect(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          fieldErrors: {
            name: ["Required"],
            description: ["Required"],
          },
        }),
      );
    });
  });
});
