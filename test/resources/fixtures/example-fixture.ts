import { faker } from "@faker-js/faker";
import { times } from "lodash";

import { Example, ExampleAttributes } from "@app/example/domain/example";
import { Uuid } from "@app/lib/uuid";

type PartialExample = Partial<ExampleAttributes>;

export class ExampleFixture {
  build(attributes?: PartialExample): Example {
    return new Example({
      id: attributes?.id ?? Uuid.generate(),
      name: attributes?.name ?? faker.lorem.word(),
      description: attributes?.description ?? faker.lorem.words(),
    });
  }

  buildMany(count = 5, attributes?: PartialExample): Example[] {
    return times(count, () => this.build(attributes));
  }
}
