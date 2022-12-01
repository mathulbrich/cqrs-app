import { Example } from "@app/example/domain/example";
import { ExampleRepository } from "@app/example/domain/repositories/example-repository";
import { Injectable } from "@app/lib/nest/injectable";
import { Optional, Option } from "@app/lib/optional";
import { Uuid } from "@app/lib/uuid";

@Injectable()
export class InMemoryExampleRepository implements ExampleRepository {
  private readonly examples: Map<string, Example> = new Map();

  async store(example: Example): Promise<void> {
    this.examples.set(example.id.toString(), example);
  }

  async *findAll(): AsyncGenerator<Example> {
    for (const example of this.examples.values()) {
      yield example;
    }
  }

  async findById(id: Uuid): Promise<Optional<Example>> {
    return Option(this.examples.get(id.toString()));
  }
}
