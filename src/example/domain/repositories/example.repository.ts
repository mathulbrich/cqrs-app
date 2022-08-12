import { Example } from "@app/example/domain/example";
import { Optional } from "@app/lib/optional";
import { Uuid } from "@app/lib/uuid";

export abstract class ExampleRepository {
  abstract store(example: Example): Promise<void>;
  abstract findById(id: Uuid): Promise<Optional<Example>>;
  abstract findAll(): AsyncGenerator<Example>;
}
