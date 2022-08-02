import { faker } from "@faker-js/faker";

import { pushIf } from "@app/lib/array";

describe("Array", () => {
  it("Should push item when condition is meet", () => {
    const items = new Array<string>();
    const value = faker.random.word();
    pushIf(items, value, true);
    expect(items).toEqual([value]);
  });

  it("Should not push item when condition is not meet", () => {
    const items = new Array<string>();
    pushIf(items, faker.random.word(), false);
    expect(items).toHaveLength(0);
  });
});
