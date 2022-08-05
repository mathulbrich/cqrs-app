import {
  fromDomain,
  toDomain,
} from "@app/example/application/repositories/schema/mongodb-example-schema";
import { ExampleFixture } from "@test/resources/fixtures/example-fixture";

describe("Mongodb Example Schema", () => {
  describe("#fromDomain", () => {
    it("Should parse from domain", () => {
      // Setup
      const example = new ExampleFixture().build();

      // Exercise
      const parsed = fromDomain(example);

      // Verify
      expect(parsed.id).toEqual(example.id.toString());
      expect(parsed.name).toEqual(example.name);
      expect(parsed.description).toEqual(example.description);
    });
  });

  describe("#toDomain", () => {
    it("Should parse to domain", () => {
      // Setup
      const example = new ExampleFixture().build();
      const parsed = fromDomain(example);

      // Exercise
      const domain = toDomain(parsed);

      // Verify
      expect(domain.id).toEqual(example.id);
      expect(domain.name).toEqual(example.name);
      expect(domain.description).toEqual(example.description);
    });
  });
});
