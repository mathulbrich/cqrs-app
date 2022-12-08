import assert from "assert";

import { isNil } from "lodash";

export const Option = <T>(value: T | null | undefined) => new Optional(value);
export const None = <T>() => new Optional<T>();

export class Optional<T> {
  constructor(private readonly internalValue?: T | null) {}

  private get value(): T | undefined {
    return isNil(this.internalValue) ? undefined : this.internalValue;
  }

  unwrap(): T | undefined {
    return this.value;
  }

  get(): T {
    assert(this.value !== undefined, "Value is undefined");
    return this.value;
  }

  orElse(defaultValue: T): T {
    return this.value === undefined ? defaultValue : this.value;
  }

  orElseThrow(error: Error): T {
    assert(this.value !== undefined, error);
    return this.value;
  }

  map<U>(fn: (value: T) => U): Optional<U> {
    return this.value === undefined ? new Optional<U>(undefined) : new Optional<U>(fn(this.value));
  }

  async mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Optional<U>> {
    return this.value === undefined
      ? new Optional<U>(undefined)
      : new Optional<U>(await fn(this.value));
  }

  match<U>(option: { none: () => U; some: (value: T) => U }): U {
    return this.value === undefined ? option.none() : option.some(this.value);
  }

  async matchAsync<U>(option: {
    none: () => Promise<U>;
    some: (value: T) => Promise<U>;
  }): Promise<U> {
    return this.value === undefined ? option.none() : option.some(this.value);
  }

  onSome(fn: (value: T) => void): void {
    if (this.value !== undefined) {
      fn(this.value);
    }
  }

  async onSomeAsync(fn: (value: T) => Promise<void>): Promise<void> {
    if (this.value !== undefined) {
      return fn(this.value);
    }
    return Promise.resolve();
  }

  isEmpty(): boolean {
    return this.value === undefined;
  }

  isDefined(): boolean {
    return this.value !== undefined;
  }
}
