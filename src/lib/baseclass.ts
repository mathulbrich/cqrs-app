export const Baseclass = <T>() =>
  class Base {
    public constructor(data: T) {
      Object.assign(this, data);
    }
  } as new (data: T) => T;
