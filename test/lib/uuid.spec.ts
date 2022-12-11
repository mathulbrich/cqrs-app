import { faker } from "@faker-js/faker";

import { Uuid } from "@app/lib/uuid";

const UuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe(Uuid.name, () => {
  it("should generate a valid uuid", () => {
    const uuid = Uuid.generate();
    expect(UuidRegex.test(uuid.toString())).toBeTruthy();
  });

  it("should be equals", () => {
    const uuid = Uuid.generate();
    const secondUuid = new Uuid(uuid.toString());
    expect(uuid.equals(secondUuid)).toBeTruthy();
  });

  it("should throw error when trying to create an invalid uuid", () => {
    expect(() => new Uuid(faker.random.word())).toThrow();
  });
});
