export interface Newable<T> {
  new (...args: unknown[]): T;
}
