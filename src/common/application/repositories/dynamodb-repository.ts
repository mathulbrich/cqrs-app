import {
  AttributeValue,
  PutItemCommand,
  DynamoDBClient,
  QueryCommandInput,
  QueryCommandOutput,
  paginateQuery,
} from "@aws-sdk/client-dynamodb";
import { Paginator } from "@aws-sdk/types";
import {
  marshall as defaultMarshall,
  NativeAttributeValue,
  unmarshall as defaultUnmarshall,
} from "@aws-sdk/util-dynamodb";
import { defaultTo } from "lodash";

import { AppConfigService } from "@app/common/config/app-config-service";

export interface DynamoDBItem {
  [key: string]: AttributeValue;
}
export interface WritableDynamoDBItem {
  [key: string]: NativeAttributeValue;
}

export type QueryCommandInputWithoutTable = Omit<QueryCommandInput, "TableName">;

export const marshall = (item?: WritableDynamoDBItem): DynamoDBItem =>
  defaultMarshall(item, {
    removeUndefinedValues: true,
  });

export const unmarshall = defaultUnmarshall;

export class DynamoDBRepository {
  constructor(
    protected readonly config: AppConfigService,
    protected readonly client = new DynamoDBClient({
      endpoint: config.dynamoDb.endpoint,
    }),
  ) {}

  protected async storeItem(item: WritableDynamoDBItem): Promise<void> {
    const command = new PutItemCommand({
      Item: marshall(item),
      TableName: this.config.dynamoDb.tableName,
    });

    await this.client.send(command);
  }

  protected query(command: QueryCommandInputWithoutTable): Paginator<QueryCommandOutput> {
    return paginateQuery(
      { client: this.client },
      {
        ...command,
        TableName: this.config.dynamoDb.tableName,
      },
    );
  }

  protected async queryAsList(command: QueryCommandInputWithoutTable): Promise<DynamoDBItem[]> {
    const query = this.query(command);

    const result: DynamoDBItem[] = [];
    for await (const item of query) {
      result.push(...defaultTo(item.Items, []));
    }

    return result;
  }

  protected async *transformFromPagination<T>(
    pages: Paginator<QueryCommandOutput>,
    transform: (item: DynamoDBItem) => T,
  ): AsyncGenerator<T> {
    for await (const page of pages) {
      for (const item of defaultTo(page.Items, [])) {
        yield transform(item);
      }
    }
  }
}
