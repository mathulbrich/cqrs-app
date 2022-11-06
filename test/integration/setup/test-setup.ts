import envs from "@test/load-envs";

import { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { values } from "lodash";

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

const ConfigurableServices = ["SQS", "DYNAMODB", "S3"] as const;
type ConfigurableService = typeof ConfigurableServices[number];

type MappedConfigurableServices = {
  DYNAMODB: DynamoDBTestContainer;
  SQS: SQSTestQueues;
  S3: S3TestStorage;
};

interface TestParameters {
  app: INestApplication;
  dynamodb: ManagedDynamoDB;
  queues: ManagedSQS;
  storage: ManagedS3;
}

interface TestArguments {
  envs?: Envs;
  services?: Array<ConfigurableService>;
}

export const INTEGRATION_DEFAULT_TIMEOUT = 300_000;

export class IntegrationTestSetup {
  private readonly queueSuffix = Uuid.generate().toString();
  private readonly tableName = `${envs.app.name}-${Uuid.generate().toString()}`;
  private readonly mappedServices: MappedConfigurableServices;
  private readonly testEnvs?: Envs;

  constructor(args?: TestArguments) {
    this.testEnvs = args?.envs;

    const defaultServices: MappedConfigurableServices = {
      DYNAMODB: new DynamoDBTestContainer(this.tableName),
      SQS: new SQSTestQueues(this.queueSuffix),
      S3: new S3TestStorage(),
    };

    this.mappedServices = args?.services
      ? Object.assign({}, ...args.services.map((key) => ({ [key]: defaultServices[key] })))
      : defaultServices;
  }

  async run(cb: (params: TestParameters) => Promise<void>): Promise<void> {
    const testEnvs = {
      [Env.SQS_QUEUE_SUFFIX]: this.queueSuffix,
      [Env.DYNAMO_DB_TABLE_NAME]: this.tableName,
      [OptionalEnv.SQS_QUEUE_WAIT_TIME_SECONDS]: "0",
      [OptionalEnv.SQS_QUEUE_POLLING_INTERVAL_MILLIS]: "0",
      ...this.testEnvs,
    };

    const services = values(this.mappedServices);
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validate: (config) => validateConfig({ ...config, ...testEnvs }),
        }),
        HttpAppModule,
      ],
    }).compile();

    const app = await bootstrapHttpApp(moduleFixture.createNestApplication());
    await Promise.all(services.map((service) => service.setUp(app)));
    await app.init();

    await cb({
      app,
      dynamodb: this.mappedServices.DYNAMODB,
      queues: this.mappedServices.SQS,
      storage: this.mappedServices.S3,
    })
      .finally(() => app.close())
      .finally(() => Promise.all(services.map((service) => service.tearDown())));
  }
}
