import { Optional, Option, None } from '@app/lib/optional';
import { Injectable } from '@nestjs/common';
import { ExampleRepository } from '@app/example/domain/repositories/example.repository';
import { Example } from '@app/example/domain/example';
import { Uuid } from '@app/lib/uuid';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { isNil } from 'lodash';
import {
  EXAMPLE_COLLECTION,
  ExampleModel,
  fromDomain,
  toDomain,
} from '@app/example/infrastructure/repositories/schema/mongodb-example-schema';

@Injectable()
export class MongoDBExampleRepository implements ExampleRepository {
  public constructor(
    @InjectConnection()
    protected readonly connection: Connection,
  ) {}

  public async store(example: Example): Promise<void> {
    await this.connection.db
      .collection(EXAMPLE_COLLECTION)
      .insertOne(fromDomain(example));
  }

  public async *findAll(): AsyncGenerator<Example> {
    const result = this.connection.db.collection(EXAMPLE_COLLECTION).find();

    for await (const item of result) {
      yield await this.parseExample(item);
    }
  }

  public async findById(id: Uuid): Promise<Optional<Example>> {
    const result = await this.connection.db
      .collection(EXAMPLE_COLLECTION)
      .findOne({ id: id.toString() });

    if (isNil(result)) {
      return None();
    }

    return Option(await this.parseExample(result));
  }

  private async parseExample(result: unknown): Promise<Example> {
    const model = new ExampleModel(result);
    await model.validate();
    return toDomain(model);
  }
}
