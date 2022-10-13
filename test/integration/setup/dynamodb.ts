import envs, { reassignEnvs } from "@test/load-envs";

import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

import { AppConfigService } from "@app/common/config/app-config-service";
import { Uuid } from "@app/lib/uuid";

export type ManagedDynamoDB = Omit<DynamoDBTestContainer, "setUp" | "tearDown" | "tableExists">;

export const runWithDynamoDB = async (cb: (dynamodb: ManagedDynamoDB) => Promise<void>) => {
  const dynamodb = new DynamoDBTestContainer();
  await dynamodb.setUp();
  await cb(dynamodb).finally(() => dynamodb.tearDown());
};

export class DynamoDBTestContainer {
  constructor(
    private readonly tableName = `${envs.app.name}-${Uuid.generate().toString()}`,
    private readonly endpoint = envs.dynamoDb.endpoint,
    private readonly client = new DynamoDBClient({ endpoint }),
  ) {}

  get config(): AppConfigService {
    return reassignEnvs({
      dynamoDb: {
        endpoint: this.endpoint,
        tableName: this.tableName,
      },
    });
  }

  async setUp(): Promise<void> {
    await this.client.send(
      new CreateTableCommand({
        TableName: this.tableName,
        KeySchema: [
          { AttributeName: "PK", KeyType: "HASH" },
          { AttributeName: "SK", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
          { AttributeName: "PK", AttributeType: "S" },
          { AttributeName: "SK", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      }),
    );
  }

  async tearDown(): Promise<void> {
    await this.client.send(
      new DeleteTableCommand({
        TableName: this.tableName,
      }),
    );
  }

  async tableExists(): Promise<boolean> {
    const command = new DescribeTableCommand({
      TableName: this.tableName,
    });

    return this.client
      .send(command)
      .then(() => true)
      .catch(() => false);
  }
}
