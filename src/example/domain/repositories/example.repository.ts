import { Optional } from '@app/lib/optional';
import { Example } from '@app/example/domain/example';

export abstract class ExampleRepository {
  public abstract store(example: Example): Promise<void>;
  public abstract findById(id: string): Promise<Optional<Example>>;
}
