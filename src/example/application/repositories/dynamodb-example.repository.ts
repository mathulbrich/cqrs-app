import { flow } from "lodash";

import {
  DynamoDBRepository,
  DynamoDBItem,
  marshall,
  unmarshall,
  DynamoDBConfig,
} from "@app/common/application/repositories/dynamodb-repository";
import {
  examplePk,
  exampleSk,
  fromDomain,
  toDomain,
  DynamoDBExampleSchema,
} from "@app/example/application/repositories/schema/dynamodb-example-schema";
import { Example } from "@app/example/domain/example";
import { ExampleRepository } from "@app/example/domain/repositories/example.repository";
import { Injectable } from "@app/lib/nest/injectable";
import { Option, Optional } from "@app/lib/optional";
import { Uuid } from "@app/lib/uuid";

@Injectable()
export class DynamoDBExampleRepository extends DynamoDBRepository implements ExampleRepository {
  constructor(config: DynamoDBConfig) {
    super(config);
  }

  async store(example: Example): Promise<void> {
    await this.storeItem(fromDomain(example));
  }

  async findById(id: Uuid): Promise<Optional<Example>> {
    const items = await this.queryAsList({
      ConsistentRead: true,
      ExpressionAttributeValues: marshall({
        ":PK": examplePk(),
        ":SK": exampleSk(id),
      }),
      KeyConditionExpression: "PK = :PK AND SK = :SK",
    });

    return Option(items[0]).map(this.fromDatabase.bind(this));
  }

  async *findAll(): AsyncGenerator<Example> {
    const query = this.query({
      ConsistentRead: true,
      ExpressionAttributeValues: marshall({
        ":PK": examplePk(),
      }),
      KeyConditionExpression: "PK = :PK",
    });

    const fromDatabase = this.fromDatabase.bind(this);
    const items = this.transformFromPagination(query, fromDatabase);
    for await (const item of items) {
      yield item;
    }
  }

  private fromDatabase(item: DynamoDBItem): Example {
    return flow(unmarshall, DynamoDBExampleSchema.parse, toDomain)(item);
  }
}
