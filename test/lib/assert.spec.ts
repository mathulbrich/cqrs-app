import {
  assert,
  assertReturningDefined,
  assertObject,
  assertLiteralOf,
  assertReturningLiteralOf,
} from "@app/lib/assert";

describe("assert", () => {
  it("should throw error if condition is false", () => {
    expect(() => assert(false)).toThrow("Assertion failed");
    expect(() => assert(false, "Custom message")).toThrow("Custom message");
  });

  it("should not throw error if condition is true", () => {
    expect(() => assert(true)).not.toThrow();
  });

  it("should assert defined", () => {
    expect(() => assertReturningDefined(undefined)).toThrow("Assertion failed");
    expect(() => assertReturningDefined(undefined, "Custom message")).toThrow("Custom message");
    expect(() => assertReturningDefined(1)).not.toThrow();
  });

  it("should assert object", () => {
    const assertFailedMessage = "Assertion failed";
    const customMessage = "Custom message";
    expect(() => assertObject(String())).toThrow(assertFailedMessage);
    expect(() => assertObject(Math.random())).toThrow(assertFailedMessage);
    expect(() => assertObject(Boolean())).toThrow(assertFailedMessage);
    expect(() => assertObject([], customMessage)).toThrow(customMessage);
    expect(() => assertObject({})).not.toThrow();
  });

  it("should assert literal of", () => {
    const fruits = ["apple", "banana", "orange"] as const;
    const assertFailedMessage = "Assertion failed";
    const customMessage = "Custom message";
    expect(() => assertLiteralOf(fruits, "blah")).toThrow(assertFailedMessage);
    expect(() => assertLiteralOf(fruits, "apple")).not.toThrow();
    expect(() => assertLiteralOf(fruits, "blah", customMessage)).toThrow(customMessage);
    expect(() => assertReturningLiteralOf(fruits, "blah")).toThrow(assertFailedMessage);
    expect(assertReturningLiteralOf(fruits, "apple")).toEqual("apple");
  });
});
