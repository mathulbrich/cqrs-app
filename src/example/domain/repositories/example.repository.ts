import { Optional } from '@app/lib/optional';
import { Example } from '@app/example/domain/example';
import { Uuid } from '@app/lib/uuid';

export abstract class ExampleRepository {
  public abstract store(example: Example): Promise<void>;
  public abstract findById(id: Uuid): Promise<Optional<Example>>;
  public abstract findAll(): AsyncGenerator<Example>;
}
