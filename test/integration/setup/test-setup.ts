import { INestApplication } from '@nestjs/common';
import { Uuid } from '@app/lib/uuid';
import { Test } from '@nestjs/testing';
import { AppModule } from '@app/app.module';
import { Connection } from 'mongoose';
import {
  connect,
  dropDatabase,
  mongooseTestConfig,
} from '@test/integration/setup/mongodb';

interface TestParameters {
  app: INestApplication;
  mongoConnection: Connection;
}

export const INTEGRATION_DEFAULT_TIMEOUT = 300_000;

export class TestSetup {
  private readonly databaseSuffix = Uuid.generate().toString();

  public async run(
    cb: (params: TestParameters) => Promise<void>,
  ): Promise<void> {
    const moduleFixture = await Test.createTestingModule({
      imports: [mongooseTestConfig(this.databaseSuffix), AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['/health'] });
    await app.init();
    const mongoConnection = await connect(this.databaseSuffix);
    await cb({ app, mongoConnection })
      .finally(() => app.close())
      .finally(() => mongoConnection.close())
      .finally(() => dropDatabase(this.databaseSuffix));
  }
}
