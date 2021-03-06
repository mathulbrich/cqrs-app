import { Optional, Option } from '@app/lib/optional';
import { Injectable } from '@nestjs/common';
import { ExampleRepository } from '@app/example/domain/repositories/example.repository';
import { Example } from '@app/example/domain/example';
import { Uuid } from '@app/lib/uuid';

@Injectable()
export class InMemoryExampleRepository implements ExampleRepository {
  private readonly examples: Map<string, Example> = new Map();

  public async store(example: Example): Promise<void> {
    this.examples.set(example.id, example);
  }

  public async findById(id: Uuid): Promise<Optional<Example>> {
    return Option(this.examples.get(id.toString()));
  }
}
