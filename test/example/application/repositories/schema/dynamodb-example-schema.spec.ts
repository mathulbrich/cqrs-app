import {
  fromDomain,
  toDomain,
} from "@app/example/application/repositories/schema/dynamodb-example-schema";
import { ExampleFixture } from "@test/resources/fixtures/example-fixture";

describe("DynamoDB Example Schema", () => {
  describe("#fromDomain", () => {
    it("should parse from domain", () => {
      // Setup
      const example = new ExampleFixture().build();

      // Exercise
      const parsed = fromDomain(example);

      // Verify
      expect(parsed.id).toEqual(example.id.toString());
      expect(parsed.name).toEqual(example.name);
      expect(parsed.description).toEqual(example.description);
      expect(parsed.createdAt).toEqual(example.createdAt.toISOString());
    });
  });

  describe("#toDomain", () => {
    it("should parse to domain", () => {
      // Setup
      const example = new ExampleFixture().build();
      const parsed = fromDomain(example);

      // Exercise
      const domain = toDomain(parsed);

      // Verify
      expect(domain.id).toEqual(example.id);
      expect(domain.name).toEqual(example.name);
      expect(domain.description).toEqual(example.description);
      expect(domain.createdAt).toEqual(example.createdAt);
    });
  });
});
