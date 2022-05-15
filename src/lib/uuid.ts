import { v4 as uuidV4 } from 'uuid';
import { z } from 'zod';

export const UuidSchema = z.string().uuid();

export class Uuid {
  private readonly uuid: string;

  public constructor(uuid: string) {
    this.uuid = UuidSchema.parse(uuid);
  }

  public static generate(): Uuid {
    return new Uuid(uuidV4());
  }

  public toString(): string {
    return this.uuid;
  }
}
