import { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";

import { bootstrapHttpApp } from "@app/bootstrap";
import { Env, validateConfig, OptionalEnv } from "@app/common/config/config-envs";
import { HttpAppModule } from "@app/http-app.module";
import { Uuid } from "@app/lib/uuid";
import { DynamoDBTestContainer, ManagedDynamoDB } from "@test/integration/setup/dynamodb";
import { ManagedS3, S3TestStorage } from "@test/integration/setup/s3";
import { ManagedSQS, SQSTestQueues } from "@test/integration/setup/sqs";

export type Envs = {
  [key: string]: string;
};

interface TestParameters {
  app: INestApplication;
  dynamodb: ManagedDynamoDB;
  queues: ManagedSQS;
  storage: ManagedS3;
}

interface TestArguments {
  envs?: Envs;
}

export const INTEGRATION_DEFAULT_TIMEOUT = 300_000;

export class IntegrationTestSetup {
  private readonly queueSuffix = `${Uuid.generate().toString()}.fifo`;
  private readonly queues = new SQSTestQueues(this.queueSuffix);
  private readonly dynamodb = new DynamoDBTestContainer();
  private readonly storage = new S3TestStorage();
  private readonly envs?: Envs;

  constructor(args?: TestArguments) {
    this.envs = args?.envs;
  }

  async run(cb: (params: TestParameters) => Promise<void>): Promise<void> {
    const envs = {
      [Env.SQS_QUEUE_SUFFIX]: this.queueSuffix,
      [Env.DYNAMO_DB_TABLE_NAME]: this.dynamodb.config.dynamoDb.tableName,
      [OptionalEnv.SQS_QUEUE_WAIT_TIME_SECONDS]: "0",
      [OptionalEnv.SQS_QUEUE_POLLING_INTERVAL_MILLIS]: "0",
      ...this.envs,
    };

    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validate: (config) => validateConfig({ ...config, ...envs }),
        }),
        HttpAppModule,
      ],
    }).compile();

    const app = await bootstrapHttpApp(moduleFixture.createNestApplication());
    await this.queues.setUp(app);
    await this.dynamodb.setUp();
    await this.storage.setUp();
    await app.init();

    await cb({
      app,
      dynamodb: this.dynamodb,
      queues: this.queues,
      storage: this.storage,
    })
      .finally(() => app.close())
      .finally(() => this.dynamodb.tearDown())
      .finally(() => this.queues.tearDown())
      .finally(() => this.storage.tearDown());
  }
}
