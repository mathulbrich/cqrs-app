import { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { raw } from "body-parser";
import getPort from "get-port";
import { Connection } from "mongoose";

import { AppModule } from "@app/app.module";
import { Env, validateConfig } from "@app/config/config-envs";
import { Uuid } from "@app/lib/uuid";
import {
  connect,
  dropDatabase,
  mongoUri,
} from "@test/integration/setup/mongodb";
import { SQSTestQueues } from "@test/integration/setup/sqs";

export type Envs = {
  [key: string]: string;
};

interface TestParameters {
  app: INestApplication;
  mongoConnection: Connection;
}

interface TestArguments {
  envs?: Envs;
}

export const INTEGRATION_DEFAULT_TIMEOUT = 300_000;

export class TestSetup {
  private readonly databaseSuffix = Uuid.generate().toString();
  private readonly queueSuffix = `${Uuid.generate().toString()}.fifo`;
  private readonly queues = new SQSTestQueues(this.queueSuffix);
  private readonly envs?: Envs;

  constructor(args?: TestArguments) {
    this.envs = args?.envs;
  }

  public async run(
    cb: (params: TestParameters) => Promise<void>,
  ): Promise<void> {
    const port = await getPort();
    const envs = {
      [Env.SQS_QUEUE_SUFFIX]: this.queueSuffix,
      [Env.MONGODB_CONNECTION_URI]: mongoUri(this.databaseSuffix),
      ...this.envs,
    };

    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validate: (config) => validateConfig({ ...config, ...envs }),
          expandVariables: true,
        }),
        AppModule,
      ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api", { exclude: ["/health"] });
    app.use(raw({ type: "application/octet-stream" }));
    await this.queues.setUp();
    await app.listen(port);
    const mongoConnection = await connect(this.databaseSuffix);

    await cb({ app, mongoConnection })
      .finally(() => app.close())
      .finally(() => mongoConnection.close())
      .finally(() => dropDatabase(this.databaseSuffix))
      .finally(() => this.queues.tearDown());
  }
}
