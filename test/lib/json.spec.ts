import { get } from "lodash";

import { safeParse, safeParseOrString } from "@app/lib/json";

describe("json", () => {
  describe("safeParse", () => {
    it("should safe parse when JSON is valid", () => {
      const parsed = safeParse('{"foo": "bar"}');
      expect(get(parsed, "foo")).toBe("bar");
    });

    it("should safe parse when JSON is invalid", () => {
      const parsed = safeParse("foo");
      expect(parsed).toBe("foo");
    });

    it("should safe parse when JSON is undefined", () => {
      const parsed = safeParse(undefined);
      expect(parsed).toBe(undefined);
    });
  });

  describe("safeParseOrString", () => {
    it("should safe parse when JSON is valid", () => {
      const parsed = safeParseOrString('{"foo": "bar"}');
      expect(get(parsed, "foo")).toBe("bar");
    });

    it("should safe parse when JSON is invalid", () => {
      const parsed = safeParseOrString("foo");
      expect(parsed).toBe("foo");
    });

    it("should safe parse and convert when JSON is a number", () => {
      const parsed = safeParseOrString(123);
      expect(parsed).toBe("123");
    });

    it("should safe parse to an empty string when JSON is undefined", () => {
      const parsed = safeParseOrString(undefined);
      expect(parsed).toBe("");
    });
  });
});
