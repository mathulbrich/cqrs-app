import { randomUUID } from "crypto";

import { z } from "zod";

export const UuidSchema = z.string().uuid();

export class Uuid {
  private readonly uuid: string;

  public constructor(uuid: string) {
    this.uuid = UuidSchema.parse(uuid);
  }

  public static generate(): Uuid {
    return new Uuid(randomUUID());
  }

  public equals(other: Uuid): boolean {
    return this.uuid === other.uuid;
  }

  public toString(): string {
    return this.uuid;
  }
}
