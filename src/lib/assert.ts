export function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? "Assertion failed");
  }
}

export function assertObject<T>(value: unknown, message?: string): asserts value is T {
  assert(typeof value === "object" && !Array.isArray(value), message);
}

export function assertLiteralOf<T extends string | symbol>(
  array: T[] | readonly T[],
  item: string | symbol,
  message?: string,
): asserts item is T {
  assert(array.includes(item as T), message);
}

// Maybe in the future we can avoid the functions "Returning" below
// https://github.com/microsoft/TypeScript/issues/40562

export const assertReturningDefined = <T>(value: T | undefined, message?: string): T => {
  assert(value !== undefined, message);
  return value;
};

export const assertReturningLiteralOf = <T extends string | symbol>(
  array: T[] | readonly T[],
  item: string | symbol,
  message?: string,
): T => {
  assertLiteralOf(array, item, message);
  return item;
};
