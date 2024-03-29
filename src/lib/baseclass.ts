export const BaseClass = <T>() =>
  class Base {
    constructor(data: T) {
      Object.assign(this, data);
    }
  } as new (data: T) => T;
