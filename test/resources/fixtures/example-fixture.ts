import { Example, ExampleAttributes } from '@app/example/domain/example';
import { Uuid } from '@app/lib/uuid';
import { times } from 'lodash';
import { faker } from '@faker-js/faker';

type PartialExample = Partial<ExampleAttributes>;

export class ExampleFixture {
  public build(attributes?: PartialExample): Example {
    return new Example({
      id: attributes?.id ?? Uuid.generate(),
      name: attributes?.name ?? faker.lorem.word(),
      description: attributes?.description ?? faker.lorem.words(),
    });
  }

  public buildMany(count = 5, attributes?: PartialExample): Example[] {
    return times(count, () => this.build(attributes));
  }
}
