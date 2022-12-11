import { assert } from "@app/lib/assert";

describe("assert", () => {
  it("should throw error if condition is false", () => {
    expect(() => assert(false)).toThrow("Assertion failed");
    expect(() => assert(false, "Custom message")).toThrow("Custom message");
  });

  it("should not throw error if condition is true", () => {
    expect(() => assert(true)).not.toThrow();
  });
});
