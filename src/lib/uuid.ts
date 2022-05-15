import { v4 as uuidV4 } from 'uuid';

export class Uuid {
  public constructor(private readonly uuid: string) {}

  public static generate(): Uuid {
    return new Uuid(uuidV4());
  }

  public toString(): string {
    return this.uuid;
  }
}
