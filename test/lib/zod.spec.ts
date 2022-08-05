import { faker } from "@faker-js/faker";

import {
  stringToBooleanDisabledByDefault,
  stringToNumber,
  stringToNumberWithDefault,
} from "@app/lib/zod";

describe("zod utils", () => {
  describe("#stringToBooleanDisabledByDefault", () => {
    it("should be false by default", () => {
      const schema = stringToBooleanDisabledByDefault();
      expect(schema.parse(undefined)).toBe(false);
    });

    it("should be true when passed 1 or true", () => {
      const schema = stringToBooleanDisabledByDefault();
      expect(schema.parse("1")).toBe(true);
      expect(schema.parse("true")).toBe(true);
    });

    it("should be false when passed 0 or false", () => {
      const schema = stringToBooleanDisabledByDefault();
      expect(schema.parse("0")).toBe(false);
      expect(schema.parse("false")).toBe(false);
    });

    it("should break when passed anything else", () => {
      const schema = stringToBooleanDisabledByDefault();
      expect(() => schema.parse(faker.random.words(3))).toThrow();
    });
  });
  describe("#stringToNumberWithDefault", () => {
    it("should return default when passed undefined", () => {
      const value = faker.datatype.number({ min: 0, max: 100 });
      const schema = stringToNumberWithDefault(value.toString());
      expect(schema.parse(undefined)).toBe(value);
    });

    it("should return passed number instead of default", () => {
      const defaultValue = faker.datatype.number({ min: 0, max: 100 });
      const currentValue = faker.datatype.number({ min: 200, max: 300 });
      const schema = stringToNumberWithDefault(defaultValue.toString());
      expect(schema.parse(currentValue.toString())).toBe(currentValue);
    });

    it("should break when passed non-number string", () => {
      const schema = stringToNumberWithDefault(faker.random.word());
      expect(() => schema.parse(faker.random.word())).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
    });
  });
  describe("#stringToNumber", () => {
    it("should convert string to number", () => {
      const value = faker.datatype.number({ min: 0, max: 100 });
      const schema = stringToNumber();
      expect(schema.parse(value.toString())).toBe(value);
    });

    it("should break when passed non-number string", () => {
      const schema = stringToNumber();
      expect(() => schema.parse(faker.random.word())).toThrow();
    });
  });
});
