import * as assert from 'assert';

export const Option = <T>(value: T | undefined) => new Optional(value);
export const None = <T>() => new Optional<T>();

export class Optional<T> {
  public constructor(private readonly value?: T) {}

  public unwrap(): T | undefined {
    return this.value;
  }

  public get(): T {
    assert(this.value !== undefined, 'Value is undefined');
    return this.value;
  }

  public orElse(defaultValue: T): T {
    return this.value === undefined ? defaultValue : this.value;
  }

  public orElseThrow(error: Error): T {
    assert(this.value !== undefined, error);
    return this.value;
  }

  public map<U>(fn: (value: T) => U): Optional<U> {
    return this.value === undefined
      ? new Optional<U>(undefined)
      : new Optional<U>(fn(this.value));
  }

  public async mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Optional<U>> {
    return this.value === undefined
      ? new Optional<U>(undefined)
      : new Optional<U>(await fn(this.value));
  }

  public match<U>(option: { none: () => U; some: (value: T) => U }): U {
    return this.value === undefined ? option.none() : option.some(this.value);
  }

  public async matchAsync<U>(option: {
    none: () => Promise<U>;
    some: (value: T) => Promise<U>;
  }): Promise<U> {
    return this.value === undefined ? option.none() : option.some(this.value);
  }

  public onSome(fn: (value: T) => void): void {
    if (this.value !== undefined) {
      fn(this.value);
    }
  }

  public async onSomeAsync(fn: (value: T) => Promise<void>): Promise<void> {
    if (this.value !== undefined) {
      return fn(this.value);
    }
  }

  public isEmpty(): boolean {
    return this.value === undefined;
  }

  public isDefined(): boolean {
    return this.value !== undefined;
  }
}
