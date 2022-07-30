import { TestSetup } from '@test/integration/setup/test-setup';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { MongoDBExampleRepository } from '@app/example/infrastructure/repositories/mongodb-example.repository';
import { Uuid } from '@app/lib/uuid';
import { retry } from 'async';

describe.skip('Create Example API', () => {
  it('Should create and store the example', async () => {
    await new TestSetup().run(async ({ app, mongoConnection }) => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/create-example')
        .send({
          name: faker.lorem.word(),
          description: faker.lorem.words(),
        })
        .expect(201);

      const exampleId = response.headers['example-id'];
      expect(exampleId).toBeDefined();

      await retry({ interval: 100, times: 20 }, async () => {
        const repository = new MongoDBExampleRepository(mongoConnection);
        const example = await repository.findById(new Uuid(exampleId));
        expect(example.isDefined()).toBeTruthy();
      });
    });
  });

  it('Should return 400 when the example is invalid', async () => {
    await new TestSetup().run(async ({ app }) => {
      await request(app.getHttpServer())
        .post('/api/v1/create-example')
        .send(faker.datatype.json())
        .expect(400);
    });
  });
});
