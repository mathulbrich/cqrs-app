import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

import { DynamoDBConfig } from "@app/common/application/repositories/dynamodb-repository";
import { OptionalEnv } from "@app/config/config-envs";
import { Uuid } from "@app/lib/uuid";

type ManagedDynamoDB = Omit<DynamoDBTestContainer, "setUp" | "tearDown" | "tableExists">;

export const runWithDynamoDB = async (cb: (dynamodb: ManagedDynamoDB) => Promise<void>) => {
  const dynamodb = new DynamoDBTestContainer();
  await dynamodb.setUp();
  await cb(dynamodb).finally(() => dynamodb.tearDown());
};

export class DynamoDBTestContainer {
  constructor(
    private readonly tableName = `example-${Uuid.generate().toString()}`,
    private readonly endpoint = process.env[OptionalEnv.DYNAMO_DB_ENDPOINT],
    private readonly client = new DynamoDBClient({ endpoint }),
  ) {}

  public get config(): DynamoDBConfig {
    return {
      tableName: this.tableName,
      endpoint: this.endpoint,
    };
  }

  public async setUp(): Promise<void> {
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

  public async tearDown(): Promise<void> {
    await this.client.send(
      new DeleteTableCommand({
        TableName: this.tableName,
      }),
    );
  }

  public async tableExists(): Promise<boolean> {
    const command = new DescribeTableCommand({
      TableName: this.tableName,
    });

    return this.client
      .send(command)
      .then(() => true)
      .catch(() => false);
  }
}
